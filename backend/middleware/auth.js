const { verifyAccessToken } = require('../services/tokenService');
const supabase = require('../database/supabase');

/**
 * Legacy Supabase Auth (keep for backward compatibility)
 */
const supabaseAuth = async function(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error.message);
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

/**
 * JWT Authentication Middleware using tokenService
 */
const jwtAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    
    // Check Bearer token first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log(`[jwtAuth] Found Bearer token: ${token.substring(0, 20)}...`);
    }
    // Fallback to cookie
    else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
      console.log(`[jwtAuth] Found cookie token: ${token.substring(0, 20)}...`);
    }

    if (!token) {
      console.log('[jwtAuth] No token found in request');
      return res.status(401).json({ 
        error: 'Access denied. Authentication token required.',
        requiresAuth: true 
      });
    }

    try {
      const decoded = verifyAccessToken(token);
      console.log(`[jwtAuth] Token verified successfully for user: ${decoded.userId}`);
      
      // Fetch fresh user data from database
      let { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      // If not found in users table, try auth API as fallback and auto-create user record
      if (error || !userData) {
        console.log(`[jwtAuth] User not found in table, trying auth API for: ${decoded.userId}`);
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(decoded.userId);
          if (authData?.user) {
            const newUserData = {
              id: authData.user.id,
              email: authData.user.email,
              username: authData.user.user_metadata?.username || null,
              telegram_id: null,
              first_name: authData.user.user_metadata?.first_name || null,
              last_name: authData.user.user_metadata?.last_name || null,
              role: 'user',
              language: 'fa',
              is_active: true
            };
            console.log(`[jwtAuth] Found user via auth API: ${newUserData.email}`);
            
            // Auto-create user record in users table
            console.log('[jwtAuth] Creating user record in users table...');
            const { data: upserted, error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: newUserData.id,
                email: newUserData.email,
                username: newUserData.username || null,
                telegram_id: newUserData.telegram_id || null,
                first_name: newUserData.first_name || null,
                last_name: newUserData.last_name || null,
                role: newUserData.role || 'user',
                language: newUserData.language || 'fa',
                is_active: newUserData.is_active !== false,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              }, { onConflict: 'id' })
              .select('*')
              .single();

            if (upsertError) {
              console.warn('[jwtAuth] users upsert warning:', upsertError.message);
              userData = newUserData;
            } else {
              console.log('[jwtAuth] User record created/updated successfully');
              userData = upserted;
            }
          }
        } catch (authErr) {
          console.error('[jwtAuth] Auth API error:', authErr);
        }
      }

      if (!userData) {
        console.log(`[jwtAuth] User not found anywhere for: ${decoded.userId}`);
        return res.status(401).json({ 
          error: 'User account not found or deactivated.',
          requiresAuth: true 
        });
      }

      // Check if user is active
      if (userData.is_active === false) {
        return res.status(401).json({ 
          error: 'User account is deactivated.',
          requiresAuth: true 
        });
      }

      // Attach user data to request in consistent format
      req.user = {
        id: userData.id,
        email: userData.email || null,
        username: userData.username || null,
        telegramId: userData.telegram_id || null,
        telegram_id: userData.telegram_id || null, // Keep both for compatibility
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        profilePicture: userData.profile_picture || null,
        role: userData.role || 'user',
        language: userData.language || 'fa',
        fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username
      };
      
      req.jwt = decoded;
      console.log(`[jwtAuth] User authenticated: ${req.user.email || req.user.username}`);
      next();
    } catch (error) {
      console.log(`[jwtAuth] Token verification failed:`, error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication token has expired.',
          requiresAuth: true,
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid authentication token.',
          requiresAuth: true,
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('[jwtAuth] Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication service error'
    });
  }
};

/**
 * Hybrid Auth Middleware (tries JWT first, falls back to Supabase)
 */
const hybridAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const legacyToken = req.header('x-auth-token');
  
  // Try JWT first (Bearer token or cookie)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return jwtAuth(req, res, next);
  }
  
  // Check for access token in cookies
  if (req.cookies && req.cookies.access_token) {
    return jwtAuth(req, res, next);
  }
  
  // Fall back to legacy Supabase auth (x-auth-token)
  if (legacyToken) {
    return supabaseAuth(req, res, next);
  }
  
  return res.status(401).json({ 
    error: 'Access denied. Authentication token required.',
    requiresAuth: true 
  });
};

/**
 * Optional Auth (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    await hybridAuth(req, res, next);
  } catch (error) {
    req.user = null;
    req.jwt = null;
    next();
  }
};

/**
 * Generate JWT Token (legacy compatibility)
 */
const generateToken = (user) => {
  const { signAccessToken } = require('../services/tokenService');
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };
  
  return signAccessToken(payload);
};

// Default export for backward compatibility
module.exports = hybridAuth;

// Named exports for specific auth methods
module.exports.supabaseAuth = supabaseAuth;
module.exports.jwtAuth = jwtAuth;
module.exports.hybridAuth = hybridAuth;
module.exports.optionalAuth = optionalAuth;
module.exports.generateToken = generateToken;
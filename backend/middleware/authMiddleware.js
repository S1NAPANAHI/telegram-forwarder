const { verifyAccessToken } = require('../services/tokenService');
const supabase = require('../database/supabase');

/**
 * Main Authentication Middleware
 * Uses tokenService for consistent JWT validation
 */
const authMiddleware = async (req, res, next) => {
  console.log('AuthMiddleware: Processing request to', req.path);
  
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    
    // Check Bearer token first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('AuthMiddleware: Found Bearer token, length:', token.length);
    }
    // Fallback to cookie
    else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
      console.log('AuthMiddleware: Found cookie token, length:', token.length);
    }

    if (!token) {
      console.log('AuthMiddleware: No token found in request');
      return res.status(401).json({ 
        error: 'Access denied. Authentication token required.',
        requiresAuth: true 
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
      console.log('AuthMiddleware: Token verified successfully for user:', decoded.userId);
    } catch (verifyErr) {
      console.log('AuthMiddleware: Token verification failed:', verifyErr.message);
      if (verifyErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication token has expired.',
          requiresAuth: true,
          code: 'TOKEN_EXPIRED'
        });
      }
      if (verifyErr.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid authentication token.',
          requiresAuth: true,
          code: 'INVALID_TOKEN'
        });
      }
      throw verifyErr;
    }

    // Try database table lookup first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, telegram_id, first_name, last_name, role, language, is_active')
      .eq('id', decoded.userId)
      .single();

    // If not found, fallback to supabase.auth.getUser and auto-create user record
    if (error || !user) {
      console.log('AuthMiddleware: User not found in table, trying auth API for:', decoded.userId);
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(decoded.userId);
        if (authData?.user) {
          const userData = {
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
          console.log('AuthMiddleware: Found user via auth API:', userData.email);
          
          // Auto-create user record in users table to prevent FK constraint errors
          console.log('AuthMiddleware: Creating user record in users table...');
          const { data: upserted, error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: userData.id,
              email: userData.email,
              username: userData.username || null,
              telegram_id: userData.telegram_id || null,
              first_name: userData.first_name || null,
              last_name: userData.last_name || null,
              role: userData.role || 'user',
              language: userData.language || 'fa',
              is_active: userData.is_active !== false,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            }, { onConflict: 'id' })
            .select('id, email, username, telegram_id, first_name, last_name, role, language, is_active')
            .single();

          if (upsertError) {
            console.warn('AuthMiddleware: users upsert warning:', upsertError.message);
            // Continue with userData even if upsert fails
            user = userData;
          } else {
            console.log('AuthMiddleware: User record created/updated successfully');
            user = upserted;
          }
        }
      } catch (authErr) {
        console.error('AuthMiddleware: Auth API error:', authErr);
      }
      
      if (!user) {
        console.log('AuthMiddleware: User not found anywhere for:', decoded.userId);
        return res.status(401).json({ 
          error: 'User account not found or deactivated.',
          requiresAuth: true 
        });
      }
    } else {
      console.log('AuthMiddleware: Found user in table:', user.email);
      
      // Update last_login for existing users
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      } catch (updateErr) {
        console.warn('AuthMiddleware: Failed to update last_login:', updateErr.message);
      }
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({ 
        error: 'User account is deactivated.',
        requiresAuth: true 
      });
    }

    // Attach user to request object in consistent format
    req.user = {
      id: user.id,
      email: user.email || null,
      username: user.username || null,
      telegramId: user.telegram_id || null,
      telegram_id: user.telegram_id || null, // Keep both for compatibility
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      role: user.role || 'user',
      language: user.language || 'fa',
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    };
    
    req.jwt = decoded;
    console.log('AuthMiddleware: User authenticated successfully:', req.user.email || req.user.username);
    next();
  } catch (e) {
    console.error('AuthMiddleware: Authentication error:', e.message);
    return res.status(500).json({ error: 'Authentication service error' });
  }
};

/**
 * Optional Authentication Middleware
 * Doesn't fail if no token is present
 */
const optionalAuth = async (req, res, next) => {
  try {
    await authMiddleware(req, res, next);
  } catch (error) {
    req.user = null;
    req.jwt = null;
    console.log('OptionalAuth: No authentication, proceeding without user');
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
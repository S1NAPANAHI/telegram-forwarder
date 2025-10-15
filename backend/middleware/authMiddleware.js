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

    // If not found, fallback to supabase.auth.getUser
    if (error || !user) {
      console.log('AuthMiddleware: User not found in table, trying auth API for:', decoded.userId);
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(decoded.userId);
        if (authData?.user) {
          user = {
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
          console.log('AuthMiddleware: Found user via auth API:', user.email);
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
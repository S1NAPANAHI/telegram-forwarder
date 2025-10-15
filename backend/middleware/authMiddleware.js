const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');
const supabase = require('../database/supabase');

class AuthMiddleware {
  // Unified JWT auth with Supabase admin fallback
  static authenticate = async (req, res, next) => {
    try {
      const headerAuth = req.headers.authorization;
      const token = headerAuth?.replace('Bearer ', '') || req.cookies?.token;

      if (!token) {
        return res.status(401).json({ 
          error: 'Access denied. Authentication token required.',
          requiresAuth: true 
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[Auth] token ok, userId:', decoded.userId);
      } catch (e) {
        console.log('[Auth] token verify failed:', e.name, e.message);
        if (e.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Invalid authentication token.', requiresAuth: true });
        }
        if (e.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Authentication token has expired.', requiresAuth: true });
        }
        throw e;
      }

      // 1) Try app users table
      let user = await UserService.getUserById(decoded.userId);

      // 2) Fallback to Supabase auth admin if not found
      if (!user) {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(decoded.userId);
          if (authData?.user) {
            user = {
              id: authData.user.id,
              email: authData.user.email,
              username: authData.user.user_metadata?.username || null,
              role: 'user',
              language: authData.user.user_metadata?.language || 'fa',
              is_active: true,
              isActive: true
            };
            console.log('[Auth] user via admin fallback:', user.id);
          }
        } catch (adminErr) {
          console.log('[Auth] admin fallback failed:', adminErr?.message);
        }
      }

      if (!user || user.isActive === false || user.is_active === false) {
        return res.status(401).json({ 
          error: 'Invalid token or user account is deactivated.',
          requiresAuth: true 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth] error:', error);
      return res.status(500).json({ error: 'Authentication service error' });
    }
  };
}

module.exports = AuthMiddleware;

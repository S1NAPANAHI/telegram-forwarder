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
          return res.status(401).json({ 
            error: 'Invalid authentication token.',
            requiresAuth: true,
            code: 'INVALID_TOKEN'
          });
        }
        if (e.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Authentication token has expired.',
            requiresAuth: true,
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(401).json({ 
          error: 'Token verification failed.',
          requiresAuth: true 
        });
      }

      if (!decoded.userId) {
        return res.status(401).json({ 
          error: 'Invalid token payload.',
          requiresAuth: true 
        });
      }

      // 1) Try app users table
      let user;
      try {
        user = await UserService.getUserById(decoded.userId);
      } catch (serviceErr) {
        console.log('[Auth] UserService error:', serviceErr.message);
      }

      // 2) Fallback to Supabase auth admin if not found
      if (!user) {
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(decoded.userId);
          if (!authError && authData?.user) {
            user = {
              id: authData.user.id,
              email: authData.user.email,
              username: authData.user.user_metadata?.username || null,
              role: authData.user.user_metadata?.role || 'user',
              language: authData.user.user_metadata?.language || 'fa',
              is_active: true,
              isActive: true
            };
            console.log('[Auth] user via admin fallback:', user.id);
          } else {
            console.log('[Auth] admin fallback failed:', authError?.message);
          }
        } catch (adminErr) {
          console.log('[Auth] admin fallback exception:', adminErr?.message);
        }
      }

      if (!user) {
        return res.status(401).json({ 
          error: 'User account not found.',
          requiresAuth: true 
        });
      }

      if (user.isActive === false || user.is_active === false) {
        return res.status(401).json({ 
          error: 'User account is deactivated.',
          requiresAuth: true 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth] unexpected error:', error);
      return res.status(500).json({ 
        error: 'Authentication service error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

module.exports = AuthMiddleware;
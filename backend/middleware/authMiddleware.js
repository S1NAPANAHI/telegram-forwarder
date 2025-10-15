// Enhanced Authentication Middleware with debugging
const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

class AuthMiddleware {
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

      const user = await UserService.getUserById(decoded.userId);
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

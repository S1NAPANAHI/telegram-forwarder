// Enhanced Authentication Middleware with proper login wall enforcement
const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

class AuthMiddleware {
  // JWT Authentication
  static authenticate = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Access denied. Authentication token required.',
          requiresAuth: true 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserService.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          error: 'Invalid token or user account is deactivated.',
          requiresAuth: true 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid authentication token.',
          requiresAuth: true 
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication token has expired.',
          requiresAuth: true 
        });
      }
      console.error('Authentication error:', error);
      return res.status(500).json({ error: 'Authentication service error' });
    }
  };

  // Telegram Web App Authentication
  static authenticateTelegramWebApp = async (req, res, next) => {
    try {
      const initData = req.headers['x-telegram-init-data'] || req.body.initData || req.query.initData;
      
      if (!initData) {
        return res.status(401).json({ 
          error: 'Telegram authentication data required',
          requiresAuth: true,
          authType: 'telegram'
        });
      }

      const isValid = AuthMiddleware.validateTelegramInitData(initData);
      if (!isValid.valid) {
        return res.status(401).json({ 
          error: 'Invalid Telegram authentication data',
          requiresAuth: true,
          authType: 'telegram'
        });
      }

      // Get or create user from Telegram data
      let user = await UserService.getUserByTelegramId(isValid.user.id.toString());
      if (!user) {
        // Auto-register user from Telegram data
        user = await UserService.createUser({
          telegramId: isValid.user.id.toString(),
          username: isValid.user.username || `user_${isValid.user.id}`,
          firstName: isValid.user.first_name,
          lastName: isValid.user.last_name,
          language: isValid.user.language_code || 'fa',
          isActive: true,
          registeredVia: 'telegram_webapp'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Telegram WebApp authentication error:', error);
      return res.status(500).json({ error: 'Telegram authentication service error' });
    }
  };

  // Validate Telegram InitData
  static validateTelegramInitData(initData) {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        throw new Error('Bot token not configured');
      }

      // Parse init data
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');

      // Create data check string
      const dataCheckArr = [];
      for (const [key, value] of urlParams.entries()) {
        dataCheckArr.push(`${key}=${value}`);
      }
      dataCheckArr.sort();
      const dataCheckString = dataCheckArr.join('\n');

      // Verify hash
      const crypto = require('crypto');
      const secretKey = crypto.createHash('sha256').update(botToken).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (calculatedHash !== hash) {
        return { valid: false, error: 'Hash verification failed' };
      }

      // Check auth date (should be recent)
      const authDate = parseInt(urlParams.get('auth_date'));
      const now = Math.floor(Date.now() / 1000);
      if (now - authDate > 86400) { // 24 hours
        return { valid: false, error: 'Authentication data is too old' };
      }

      // Parse user data
      const userData = JSON.parse(urlParams.get('user') || '{}');
      return { valid: true, user: userData };
    } catch (error) {
      console.error('Telegram init data validation error:', error);
      return { valid: false, error: error.message };
    }
  }

  // Role-based authorization
  static authorize = (roles = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          requiresAuth: true 
        });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions for this resource' 
        });
      }

      next();
    };
  };

  // Rate limiting middleware
  static rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old requests
      if (requests.has(userId)) {
        const userRequests = requests.get(userId).filter(time => time > windowStart);
        requests.set(userId, userRequests);
      }
      
      const userRequests = requests.get(userId) || [];
      
      if (userRequests.length >= maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
        });
      }
      
      userRequests.push(now);
      requests.set(userId, userRequests);
      next();
    };
  };
}

module.exports = AuthMiddleware;
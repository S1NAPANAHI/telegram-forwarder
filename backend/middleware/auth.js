const jwt = require('jsonwebtoken');
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
 * JWT Authentication Middleware for Telegram WebApp
 */
const jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch fresh user data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !userData) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not found or token invalid' 
      });
    }

    // Attach user data to request
    req.user = {
      id: userData.id,
      telegramId: userData.telegram_id,
      username: userData.username,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      profilePicture: userData.profile_picture,
      fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username
    };
    
    req.jwt = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    console.error('JWT authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication error' 
    });
  }
};

/**
 * Hybrid Auth Middleware (tries JWT first, falls back to Supabase)
 */
const hybridAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const legacyToken = req.header('x-auth-token');
  
  // Try JWT first (Bearer token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return jwtAuth(req, res, next);
  }
  
  // Fall back to legacy Supabase auth (x-auth-token)
  if (legacyToken) {
    return supabaseAuth(req, res, next);
  }
  
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'No authentication method provided' 
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
 * Generate JWT Token
 */
const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const payload = {
    userId: user.id,
    telegramId: user.telegram_id,
    username: user.username,
    email: user.email,
    type: 'telegram_webapp'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'telegram-forwarder'
  });
};

// Default export for backward compatibility
module.exports = hybridAuth;

// Named exports for specific auth methods
module.exports.supabaseAuth = supabaseAuth;
module.exports.jwtAuth = jwtAuth;
module.exports.hybridAuth = hybridAuth;
module.exports.optionalAuth = optionalAuth;
module.exports.generateToken = generateToken;
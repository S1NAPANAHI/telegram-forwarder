const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// Handle Redis client errors
redisClient.on('error', (err) => console.error('Redis Client Error', err));

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    }),
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different limiters for different endpoints
const authLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests
  'Too many login attempts'
);
const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
  'Too many API requests'
);
const keywordLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50, // 50 requests
  'Too many keyword additions'
);

module.exports = {
  authLimiter,
  apiLimiter,
  keywordLimiter
};
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'telegram-forwarder-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://frontend-service-51uy.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined/null values

logger.info(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    logger.warn(`❌ CORS blocked origin: ${origin}`);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'telegram-forwarder-backend',
    cors_origins: allowedOrigins
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Telegram Forwarder Backend API',
    cors_origins: allowedOrigins,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes with error handling
const routes = [
  { path: '/api/auth', file: './routes/auth.js' },
  { path: '/api/keywords', file: './routes/keywords' },
  { path: '/api/channels', file: './routes/channels' },
  { path: '/api/destinations', file: './routes/destinations' },
  { path: '/api/discovery', file: './routes/discovery' },
  { path: '/api/client-auth', file: './routes/clientAuth' },
  { path: '/api/bot', file: './routes/bot' },
  { path: '/api/monitoring', file: './routes/monitoring' },
  { path: '/api/logs', file: './routes/logs' },
  { path: '/api/analytics', file: './routes/analytics' }
];

// Load routes with error handling
routes.forEach(route => {
  try {
    const routeHandler = require(route.file);
    app.use(route.path, routeHandler);
    logger.info(`✅ Route loaded: ${route.path}`);
  } catch (error) {
    logger.warn(`⚠️ Failed to load route ${route.path}: ${error.message}`);
    // Create a fallback route that returns 503
    app.use(route.path, (req, res) => {
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        route: route.path 
      });
    });
  }
});

// 404 handler - fixed for Express 5 compatibility
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize monitoring manager after server starts
async function initializeServices() {
  try {
    logger.info('🔄 Initializing services...');
    
    // Initialize monitoring manager (this starts the Telegram bot)
    const monitoringManager = require('./services/monitoringManager');
    await monitoringManager.initialize();
    
    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error?.message || error);
    // Don't exit - let the API server continue running even if bot fails
  }
}

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize services after server is running
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    // Shutdown monitoring manager
    const monitoringManager = require('./services/monitoringManager');
    await monitoringManager.shutdown();
  } catch (error) {
    logger.warn('Error during monitoring manager shutdown:', error?.message || error);
  }
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    // Shutdown monitoring manager
    const monitoringManager = require('./services/monitoringManager');
    await monitoringManager.shutdown();
  } catch (error) {
    logger.warn('Error during monitoring manager shutdown:', error?.message || error);
  }
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
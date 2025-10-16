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
const PORT = process.env.PORT || 10000;

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
].filter(Boolean);

console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error('CORS policy violation'), false);
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Health check endpoint - always available
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'telegram-forwarder-backend',
    node_version: process.version,
    uptime: process.uptime(),
    port: PORT,
    cors_origins: allowedOrigins.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Telegram Forwarder Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Load core routes with fallback handling
function loadRoute(routePath, routeFile) {
  try {
    const routeHandler = require(routeFile);
    app.use(routePath, routeHandler);
    console.log(`✅ Route loaded: ${routePath}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Route ${routePath} failed: ${error.message}`);
    // Create fallback route
    app.use(routePath, (req, res) => {
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        route: routePath,
        message: `Route failed to load: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    });
    return false;
  }
}

// Core routes (most important first)
console.log('Loading core routes...');
loadRoute('/api/auth', './routes/auth.js');
loadRoute('/api/channels', './routes/channels');
loadRoute('/api/keywords', './routes/keywords');
loadRoute('/api/destinations', './routes/destinations');
loadRoute('/api/logs', './routes/logs');
loadRoute('/api/analytics', './routes/analytics');
loadRoute('/api/messages', './routes/messages'); // NEW: Message feed routes

// Bot and automation routes
loadRoute('/api/bot', './routes/bot');
loadRoute('/api/auto-promote', './routes/autoPromote');

// Optional routes
console.log('Loading optional routes...');
loadRoute('/api/client-auth', './routes/clientAuth');
loadRoute('/api/discovery', './routes/discovery');
loadRoute('/api/monitoring', './routes/monitoring');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server IMMEDIATELY
console.log(`🚀 Starting server on port ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Node.js version: ${process.version}`);
  
  // Now that server is listening, initialize services in background
  setImmediate(() => {
    initializeServicesInBackground();
  });
});

// Background service initialization (non-blocking)
async function initializeServicesInBackground() {
  try {
    console.log('🔄 Initializing background services...');
    
    // Check if monitoring manager exists
    const fs = require('fs');
    const monitoringPath = path.join(__dirname, 'services', 'monitoringManager.js');
    
    if (!fs.existsSync(monitoringPath)) {
      console.log('⚠️ Monitoring manager not found, skipping...');
      return;
    }
    
    // Try to initialize monitoring manager
    const monitoringManager = require('./services/monitoringManager');
    if (monitoringManager && typeof monitoringManager.initialize === 'function') {
      await monitoringManager.initialize();
      console.log('✅ Background services initialized successfully');
    } else {
      console.log('⚠️ Monitoring manager initialize method not available');
    }
    
  } catch (error) {
    console.error('❌ Background service initialization failed:', error.message);
    console.log('ℹ️ Server will continue running with limited functionality');
  }
}

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.warn('Force exiting after timeout');
    process.exit(1);
  }, 10000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = app;
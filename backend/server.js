// Global error handler for Chrome/Puppeteer issues
process.on('uncaughtException', (error) => {
  if (error.message.includes('Chrome') || error.message.includes('puppeteer')) {
    console.log('Chrome/Puppeteer error detected - continuing without Eitaa monitoring');
    return;
  }
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.env' : '../.env' });

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS - Fix credentials issue with specific origin
const allowedOrigins = [
  'https://frontend-service-51uy.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
  allowedOrigins.push(frontendUrl);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS: Origin ${origin} not allowed`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-telegram-init-data'],
  exposedHeaders: ['set-cookie']
}));

// IMPORTANT: Express v5 no longer supports '*' in app.options; handle preflight via cors and a safe route
app.options('/__preflight__', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,x-telegram-init-data');
  res.sendStatus(200);
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(morgan('combined'));

// Rate limiting - more lenient for auth endpoints
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login-cookie', authLimiter);

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Telegram Forwarder Backend is running',
    version: '1.0.0',
    cors: {
      allowedOrigins,
      frontendUrl: process.env.FRONTEND_URL
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes
try {
  app.use('/api/auth', require('./routes/auth.session'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/auth', require('./routes/auth.webapp'));
  app.use('/api/keywords', require('./routes/keywords'));
  app.use('/api/channels', require('./routes/channels'));
  app.use('/api/destinations', require('./routes/destinations'));
  app.use('/api/monitoring', require('./routes/monitoring'));
  app.use('/api/logs', require('./routes/logs'));
} catch (routeError) {
  console.error('Error loading routes:', routeError);
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: `Route ${req.method} ${req.path} not found` });
});

// Initialize monitoring manager asynchronously after server starts
const initializeMonitoring = async () => {
  try {
    const monitoringManager = require('./services/monitoringManager');
    await monitoringManager.initialize();
    console.log('Monitoring services initialized successfully');
  } catch (error) {
    console.error('Warning: Some monitoring services failed to initialize:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS allowed origins:', allowedOrigins);
  console.log('Frontend URL from env:', process.env.FRONTEND_URL);
  setTimeout(() => { initializeMonitoring().catch(error => { console.error('Failed to initialize monitoring:', error); }); }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => { console.log('SIGTERM received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });
process.on('SIGINT', () => { console.log('SIGINT received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });

module.exports = app;

// Global error handler for Chrome/Puppeteer issues
process.on('uncaughtException', (error) => {
  if (error && (error.message?.includes('Chrome') || error.message?.includes('puppeteer'))) {
    console.log('Chrome/Puppeteer error detected - continuing without Eitaa monitoring');
    return;
  }
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.env' : '../.env' });

const app = express();

// Core middleware
app.use(express.json());
app.use(cookieParser());

// CORS (manual, no external dependency)
const allowedOrigins = [
  'https://frontend-service-51uy.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && !allowedOrigins.includes(frontendUrl)) allowedOrigins.push(frontendUrl);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,x-telegram-init-data');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Security + logging
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(morgan('combined'));

// Rate limiters
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login-cookie', authLimiter);

// Health endpoints
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Telegram Forwarder Backend is running',
    version: '1.0.0',
    cors: { allowedOrigins, frontendUrl: process.env.FRONTEND_URL }
  });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// Routes loader
const routes = [
  { path: '/api/auth', file: './routes/auth.js' },
  { path: '/api/keywords', file: './routes/keywords' },
  { path: '/api/channels', file: './routes/channels' },
  { path: '/api/destinations', file: './routes/destinations' },
  { path: '/api/discovery', file: './routes/discovery' },
  { path: '/api/client-auth', file: './routes/clientAuth' },
  { path: '/api/monitoring', file: './routes/monitoring' },
  { path: '/api/logs', file: './routes/logs' },
  { path: '/api/analytics', file: './routes/analytics' }
];

routes.forEach(route => {
  try {
    if (route.file) {
      const router = require(route.file);
      app.use(route.path, router);
      console.log(`✓ Loaded route: ${route.path} from ${route.file}`);
    } else if (route.files) {
      route.files.forEach(file => {
        try {
          const router = require(file);
          app.use(route.path, router);
          console.log(`✓ Loaded route: ${route.path} from ${file}`);
        } catch (fileErr) {
          console.error(`✗ Failed to load route ${file} for ${route.path}:`, fileErr.message);
        }
      });
    }
  } catch (err) {
    console.error(`✗ Failed to load route ${route.path}:`, err.message);
  }
});

// Error handlers
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: `Route ${req.method} ${req.path} not found` });
});

// Monitoring initialization
const initializeMonitoring = async () => {
  try {
    const monitoringManager = require('./services/monitoringManager');
    await monitoringManager.initialize();
    console.log('✓ Monitoring services initialized successfully');
  } catch (error) {
    console.error('⚠ Warning: Some monitoring services failed to initialize:', error.message);
  }
};

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌐 CORS allowed origins:', allowedOrigins);
  console.log('🔗 Frontend URL from env:', process.env.FRONTEND_URL);
  console.log('🔐 JWT secret configured:', !!process.env.JWT_SECRET);
  setTimeout(() => { initializeMonitoring().catch(err => console.error('❌ Failed to initialize monitoring:', err.message)); }, 1000);
});

process.on('SIGTERM', () => { console.log('SIGTERM received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });
process.on('SIGINT', () => { console.log('SIGINT received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });

module.exports = app;

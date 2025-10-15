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
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.env' : '../.env' });

const app = express();

// Middleware
app.use(express.json());

// CORS - allow exact frontend origin and credentials/headers
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-telegram-init-data']
}));

app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Telegram Forwarder Backend is running',
    version: '1.0.0'
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
  setTimeout(() => { initializeMonitoring().catch(error => { console.error('Failed to initialize monitoring:', error); }); }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => { console.log('SIGTERM received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });
process.on('SIGINT', () => { console.log('SIGINT received, shutting down gracefully'); server.close(() => { console.log('Process terminated'); }); });

module.exports = app;

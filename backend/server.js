// ... previous code ...

// Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/auth/telegram-webapp', require('./routes/telegram-webapp'));
  app.use('/api/keywords', require('./routes/keywords'));
  app.use('/api/channels', require('./routes/channels'));
  app.use('/api/destinations', require('./routes/destinations'));
  app.use('/api/monitoring', require('./routes/monitoring'));
  app.use('/api/logs', require('./routes/logs'));
} catch (routeError) {
  console.error('Error loading routes:', routeError);
  // Continue without some routes if there's an issue
}

// ... rest of file ...

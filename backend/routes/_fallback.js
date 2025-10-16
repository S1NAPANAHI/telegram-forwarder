/**
 * Fallback routes for missing or broken route files
 * This ensures the server can start even when some route files are missing
 */

const express = require('express');
const router = express.Router();

// Generic fallback for missing routes
const createFallbackRoute = (routeName, description) => {
  const fallbackRouter = express.Router();
  
  // Handle all HTTP methods
  fallbackRouter.all('*', (req, res) => {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      route: routeName,
      description: description || `${routeName} service is not available`,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      suggestion: 'This feature may be restored in a future deployment'
    });
  });
  
  return fallbackRouter;
};

// Discovery route fallback
const discoveryFallback = createFallbackRoute('/api/discovery', 'Chat discovery service');

// Monitoring route fallback  
const monitoringFallback = createFallbackRoute('/api/monitoring', 'Channel monitoring service');

// Bot route fallback
const botFallback = createFallbackRoute('/api/bot', 'Telegram bot management service');

// Client auth fallback
const clientAuthFallback = createFallbackRoute('/api/client-auth', 'Telegram client authentication service');

module.exports = {
  discoveryFallback,
  monitoringFallback,
  botFallback,
  clientAuthFallback,
  createFallbackRoute
};
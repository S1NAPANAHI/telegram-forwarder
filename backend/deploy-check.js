#!/usr/bin/env node
/**
 * Deployment Health Check Script
 * Verifies that all required components are available before starting the main server
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running deployment health check...');
console.log(`📦 Node.js version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Check required files
const requiredFiles = [
  'server.js',
  'package.json',
  'database/supabase.js',
  'middleware/authMiddleware.js'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles);
  process.exit(1);
}

// Check route files
const routeFiles = [
  'routes/auth.js',
  'routes/keywords.js',
  'routes/channels.js',
  'routes/destinations.js',
  'routes/clientAuth.js',
  'routes/bot.js',
  'routes/logs.js',
  'routes/analytics.js'
];

const availableRoutes = [];
const unavailableRoutes = [];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      require(filePath);
      availableRoutes.push(file);
    } catch (error) {
      console.warn(`⚠️  Route ${file} exists but has syntax errors:`, error.message);
      unavailableRoutes.push({ file, error: error.message });
    }
  } else {
    unavailableRoutes.push({ file, error: 'File not found' });
  }
});

console.log(`✅ Available routes: ${availableRoutes.length}`);
availableRoutes.forEach(route => console.log(`   - ${route}`));

if (unavailableRoutes.length > 0) {
  console.log(`⚠️  Unavailable routes: ${unavailableRoutes.length}`);
  unavailableRoutes.forEach(({ file, error }) => {
    console.log(`   - ${file}: ${error}`);
  });
}

// Check optional files
const optionalFiles = [
  'routes/discovery.js',
  'routes/monitoring.js',
  'services/monitoringManager.js',
  'bots/telegramBot.js',
  'bots/eitaaBot.js',
  'scraper/newsScraper.js'
];

const optionalAvailable = [];
const optionalMissing = [];

optionalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      require(filePath);
      optionalAvailable.push(file);
    } catch (error) {
      console.warn(`⚠️  Optional file ${file} has issues:`, error.message);
      optionalMissing.push({ file, error: error.message });
    }
  } else {
    optionalMissing.push({ file, error: 'File not found' });
  }
});

console.log(`📋 Optional components available: ${optionalAvailable.length}`);
optionalAvailable.forEach(file => console.log(`   + ${file}`));

if (optionalMissing.length > 0) {
  console.log(`📋 Optional components missing: ${optionalMissing.length}`);
  optionalMissing.forEach(({ file, error }) => {
    console.log(`   - ${file}: ${error}`);
  });
}

// Environment variables check
const requiredEnvVars = ['PORT'];
const optionalEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'TELEGRAM_BOT_TOKEN',
  'TG_API_ID',
  'TG_API_HASH',
  'JWT_SECRET',
  'FRONTEND_URL'
];

console.log('\n🔐 Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: Set`);
  } else {
    console.log(`   ❌ ${envVar}: Missing (required)`);
  }
});

optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: Set`);
  } else {
    console.log(`   ⚪ ${envVar}: Not set (optional)`);
  }
});

console.log('\n✅ Health check completed!');
console.log('🚀 Server should be able to start with basic functionality.');

if (unavailableRoutes.length > 0) {
  console.log('⚠️  Some routes will return 503 errors until their dependencies are resolved.');
}

if (optionalMissing.length > 0) {
  console.log('ℹ️  Some optional features may not work until their dependencies are available.');
}
const puppeteerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ]
};

// For production/cloud environments
if (process.env.NODE_ENV === 'production') {
  // Try to use system Chrome first
  const chromePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  
  const fs = require('fs');
  for (const path of chromePaths) {
    if (fs.existsSync(path)) {
      puppeteerConfig.executablePath = path;
      console.log(`Using system Chrome at: ${path}`);
      break;
    }
  }
  
  // If no system Chrome found, fall back to bundled Chromium
  if (!puppeteerConfig.executablePath) {
    console.log('Using Puppeteer bundled Chromium for production');
    // Let Puppeteer use its bundled Chromium
  }
} else {
  console.log('Using Puppeteer bundled Chromium for development');
}

module.exports = puppeteerConfig;
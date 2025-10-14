const path = require('path');

const puppeteerConfig = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--window-size=1920,1080',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',
    '--disable-javascript',
    '--disable-default-apps'
  ]
};

// For Render deployment, use Puppeteer's bundled Chromium
if (process.env.NODE_ENV === 'production') {
  // Let Puppeteer use its own bundled Chromium
  // Don't set executablePath - let Puppeteer handle it
  console.log('Using Puppeteer bundled Chromium for production');
} else {
  // For local development
  console.log('Using local Puppeteer configuration');
}

module.exports = puppeteerConfig;
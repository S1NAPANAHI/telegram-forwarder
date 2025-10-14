const path = require('path');
const fs = require('fs');

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
    '--disable-default-apps'
  ]
};

// For Render deployment, dynamically find Chrome
if (process.env.NODE_ENV === 'production') {
  try {
    const puppeteerCacheDir = '/opt/render/.cache/puppeteer';
    const chromeDir = path.join(puppeteerCacheDir, 'chrome');
    
    if (fs.existsSync(chromeDir)) {
      const versions = fs.readdirSync(chromeDir);
      if (versions.length > 0) {
        // Use the first (and likely only) version found
        const latestVersion = versions[0];
        const chromePath = path.join(chromeDir, latestVersion, 'chrome-linux64', 'chrome');
        
        if (fs.existsSync(chromePath)) {
          puppeteerConfig.executablePath = chromePath;
          console.log('Found Chrome at:', chromePath);
        } else {
          console.log('Chrome binary not found at expected path:', chromePath);
        }
      }
    }
  } catch (error) {
    console.error('Error finding Chrome installation:', error);
  }
  
  if (!puppeteerConfig.executablePath) {
    console.log('Falling back to system Chrome detection');
    // Try common system paths as fallback
    const systemPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser'
    ];
    
    for (const systemPath of systemPaths) {
      if (fs.existsSync(systemPath)) {
        puppeteerConfig.executablePath = systemPath;
        console.log('Using system Chrome at:', systemPath);
        break;
      }
    }
  }
} else {
  // For local development
  console.log('Using local Puppeteer configuration');
}

module.exports = puppeteerConfig;
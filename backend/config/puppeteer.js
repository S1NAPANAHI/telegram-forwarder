const puppeteerConfig = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  headless: 'new'
};

if (process.env.NODE_ENV === 'production') {
  // Use system Chrome in Render
  puppeteerConfig.executablePath = '/usr/bin/google-chrome';
}

module.exports = puppeteerConfig;
# Troubleshooting Guide

## Common Deployment Issues

### 1. TypeError: Cannot read properties of undefined (reading 'welcome')

**Problem**: The STRINGS object in `backend/bots/telegramBot.js` is not properly defined.

**Solution**: 
- Ensure the STRINGS object contains all required language strings
- Check that default fallbacks are in place
- Verify the language detection functions are working correctly

**Fixed in**: Commit `cd952d2` - Added complete STRINGS object with Farsi and English translations.

### 2. Security Vulnerabilities in Dependencies

**Problem**: npm audit shows moderate and critical vulnerabilities.

**Solutions**:
```bash
# Run security audit
npm audit

# Fix automatically
npm audit fix

# Force fix for breaking changes
npm audit fix --force
```

**Fixed in**: Commit `781cf30` - Cleaned up duplicate dependencies and added audit script.

### 3. Puppeteer Chrome Installation Issues

**Problem**: Chrome browser not available in production environment.

**Current Status**: 
- Eitaa monitoring disabled when Chrome is unavailable
- Telegram monitoring continues to work normally

**Solutions**:
- Use Puppeteer bundled Chromium (current implementation)
- Configure Docker with Chrome dependencies if needed
- Consider alternative scraping methods for production

### 4. Environment Variables Issues

**Common Variables to Check**:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
FRONTEND_URL=https://your-frontend-url.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

**Verification**:
- Check `.env` file exists and contains required variables
- Verify environment variables are loaded correctly
- Test database connections during startup

### 5. Database Connection Issues

**Symptoms**: 
- User language cannot be retrieved/set
- Channel monitoring fails to initialize
- Error logs show database connection failures

**Solutions**:
- Verify Supabase credentials
- Check database schema matches expected structure
- Ensure proper error handling for database operations

### 6. Bot Token Issues

**Symptoms**:
- Bot fails to initialize
- "Unauthorized" errors from Telegram API

**Solutions**:
- Verify TELEGRAM_BOT_TOKEN is correctly set
- Check bot is active in BotFather
- Ensure token has no extra spaces or characters

## Deployment Best Practices

### 1. Pre-deployment Checklist
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Test all environment variables
- [ ] Verify database connections
- [ ] Test bot functionality locally
- [ ] Check all required language strings exist

### 2. Monitoring
- Monitor application logs for uncaught exceptions
- Set up health checks for critical services
- Monitor database connection status
- Track bot API rate limits

### 3. Error Handling
- Implement graceful fallbacks for service failures
- Add comprehensive logging for debugging
- Use try-catch blocks around critical operations
- Provide user-friendly error messages

## Logging and Debugging

### Enable Debug Logging
```javascript
// Add to your service files
console.log('Debug info:', { variable: value });
console.error('Error details:', error);
```

### Check Application Logs
```bash
# For Render deployment
# View logs in Render dashboard

# For local development
npm start
```

### Database Query Debugging
```javascript
// Add logging to database operations
try {
  const result = await supabase.from('table').select('*');
  console.log('Query result:', result);
} catch (error) {
  console.error('Database error:', error);
}
```

## Getting Help

If you encounter issues not covered here:

1. Check the application logs for specific error messages
2. Verify all environment variables are correctly set
3. Test individual components in isolation
4. Review recent commits for changes that might affect functionality
5. Create an issue with:
   - Error message and stack trace
   - Environment details (Node.js version, deployment platform)
   - Steps to reproduce the issue
   - Relevant configuration details (without sensitive data)

# Telegram Forwarder Backend - Deployment Guide

## Current Status

✅ **Fixed Issues:**
- Node.js version compatibility (pinned to 20.x)
- Express v4 compatibility
- Route loading errors
- Service initialization robustness
- Error handling improvements

## Quick Deployment Check

Before deploying, run the health check:
```bash
node deploy-check.js
```

## Environment Variables Required

### Essential
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Database
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Authentication
- `JWT_SECRET` - Secret for JWT tokens

### Bot Configuration (Optional)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TG_API_ID` - Telegram API ID
- `TG_API_HASH` - Telegram API hash

### Frontend
- `FRONTEND_URL` - Your frontend URL for CORS

## Deployment on Render

### 1. Node.js Version
Render will automatically use Node.js 20.x due to:
- `.node-version` file (highest priority)
- `package.json` engines field

### 2. Build Command
```bash
npm run build
```

This will:
1. Run health check (`prebuild`)
2. Install dependencies
3. Fix moderate security vulnerabilities
4. Confirm build completion (`postbuild`)

### 3. Start Command
```bash
npm start
```

This will:
1. Run health check (`prestart`)
2. Start the server

## Troubleshooting Common Issues

### Issue 1: Service Initialization Failed
**Symptoms:** "Failed to initialize services" in logs
**Solution:** The server will continue running. Bot features may be limited.

### Issue 2: Route Loading Errors
**Symptoms:** "Failed to load route" warnings
**Solution:** Affected routes return 503 status. Core API still functional.

### Issue 3: Database Connection Issues
**Symptoms:** Database-related errors in logs
**Solution:** 
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Check network connectivity
3. Verify Supabase project is active

### Issue 4: CORS Errors
**Symptoms:** Frontend can't connect
**Solution:**
1. Set `FRONTEND_URL` environment variable
2. Verify frontend URL in allowed origins list
3. Check browser console for specific CORS errors

## API Endpoints Status

### Always Available
- `GET /` - API info
- `GET /health` - Health check with detailed status

### Core Functionality
- `POST /api/auth/*` - Authentication
- `GET|POST /api/channels/*` - Channel management  
- `GET|POST /api/keywords/*` - Keyword management
- `GET|POST /api/destinations/*` - Destination management
- `GET /api/logs/*` - Logging
- `GET /api/analytics/*` - Analytics

### Bot Features (Optional)
- `POST /api/bot/*` - Bot control
- `GET|POST /api/discovery/*` - Chat discovery
- `GET|POST /api/monitoring/*` - Monitoring control
- `POST /api/client-auth/*` - Client authentication

## Health Check Endpoint

`GET /health` returns:
```json
{
  "status": "OK",
  "timestamp": "2025-10-16T08:45:01.397Z",
  "service": "telegram-forwarder-backend",
  "cors_origins": ["http://localhost:3000", "..."],
  "node_version": "v20.15.1",
  "uptime": 123.456
}
```

## Monitoring

The server provides detailed logging:
- ✅ Successful operations
- ⚠️ Warnings (non-critical issues)
- ❌ Errors (with context)

## Performance Considerations

1. **Memory Usage:** Puppeteer can be memory-intensive
2. **CPU Usage:** Bot monitoring uses periodic checks
3. **Network:** Database connections are pooled

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests/15min per IP)
- JWT authentication
- Input validation and sanitization

## Scaling Notes

- Stateless design (except for in-memory monitoring state)
- Database handles persistence
- Can run multiple instances with load balancer
- WebSocket connections limited to single instance

## Backup and Recovery

- All critical data stored in Supabase
- Configuration via environment variables
- No local file dependencies
- Graceful shutdown handling

## Development vs Production

### Development
- Detailed error messages
- Console logging
- No request limits

### Production
- Sanitized error messages
- Structured logging
- Rate limiting enabled
- Security headers active

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
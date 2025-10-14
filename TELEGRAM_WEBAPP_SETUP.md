# Telegram WebApp Setup Guide

This guide explains how to connect your Telegram bot to the modern web interface so users can access the admin panel directly from Telegram.

## Overview

Your bot now supports Telegram Web Apps, allowing users to open your admin interface directly inside Telegram with automatic authentication.

**Frontend URL:** https://frontend-service-51uy.onrender.com  
**Backend URL:** https://backend-service-idry.onrender.com  
**WebApp Entry Point:** https://frontend-service-51uy.onrender.com/webapp

## How It Works

1. **User taps WebApp button** in Telegram
2. **Telegram opens your frontend** at `/webapp` with `initData`
3. **Frontend sends `initData`** to your backend at `/api/auth/telegram-webapp/session`
4. **Backend verifies signature** using `TELEGRAM_BOT_TOKEN`
5. **Backend creates/updates user** in Supabase and returns JWT token
6. **Frontend stores JWT** and redirects to `/dashboard` showing the modern UI

## Environment Variables Required

### Frontend Service (Render)
```bash
NEXT_PUBLIC_API_URL=https://backend-service-idry.onrender.com
```

### Backend Service (Render)
```bash
TELEGRAM_BOT_TOKEN=your_actual_bot_token
JWT_SECRET=your_jwt_secret_key
# Your other existing env vars (Supabase, etc.)
```

## Bot Configuration

Your bot now automatically:
- Sets a **persistent menu button** pointing to the WebApp
- Responds to all commands (`/start`, `/help`, `/status`, `/webapp`) with WebApp buttons
- Shows the admin panel button for unknown commands

### Manual Bot API Calls (if needed)

**Set Persistent Menu Button:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{
  "menu_button": {
    "type": "web_app",
    "text": "Open Panel",
    "web_app": {
      "url": "https://frontend-service-51uy.onrender.com/webapp"
    }
  }
}'
```

**Send WebApp Button in Messages:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
-H "Content-Type: application/json" \
-d '{
  "chat_id": "CHAT_ID",
  "text": "🚀 Access your admin panel:",
  "reply_markup": {
    "inline_keyboard": [[
      {
        "text": "🚀 Open Admin Panel",
        "web_app": { "url": "https://frontend-service-51uy.onrender.com/webapp" }
      }
    ]]
  }
}'
```

## Testing the Setup

### 1. Test Frontend Directly
Visit: https://frontend-service-51uy.onrender.com/dashboard
- Should show the new modern UI
- Should work in any browser

### 2. Test WebApp Bootstrap
Visit: https://frontend-service-51uy.onrender.com/webapp
- Should redirect to `/dashboard` (fallback mode)
- This confirms the WebApp entry point exists

### 3. Test in Telegram
1. Open your bot in Telegram
2. Send `/start`
3. Tap "🚀 Open Admin Panel"
4. Should open inside Telegram WebView
5. Should authenticate automatically and show the dashboard

### 4. Debug Page
Visit: https://frontend-service-51uy.onrender.com/debug
- Shows current `NEXT_PUBLIC_API_URL` value
- Shows if Telegram `initData` is detected
- Useful for troubleshooting configuration

## Troubleshooting

**Frontend build fails:**
- ✅ Fixed: TailwindCSS configuration updated to use `@tailwind` directives
- Redeploy frontend after the fix

**WebApp opens but shows old UI:**
- ✅ Fixed: `/dashboard` now uses the modern UI from `dashboard-new.tsx`
- Old UI is backed up at `/dashboard-old` if needed

**Authentication fails:**
- Check `TELEGRAM_BOT_TOKEN` is set on backend
- Check `JWT_SECRET` is set on backend
- Check `NEXT_PUBLIC_API_URL` is set on frontend
- Verify backend is deployed and accessible

**Bot still sends old links:**
- ✅ Fixed: All bot commands now send WebApp buttons
- Persistent menu button is set automatically on bot startup

**Users see placeholder domain:**
- ✅ Fixed: All URLs updated to use your actual Render URLs

**JWT tokens not working:**
- Ensure `JWT_SECRET` environment variable is set on backend
- Check browser localStorage for `telegram_token`
- Verify API calls include `Authorization: Bearer <token>` header

## Features of the New UI

✅ **Modern Components:**
- Professional Layout with sidebar navigation
- Dark/Light mode toggle
- Interactive charts and analytics
- Advanced data tables with search/sort
- Responsive mobile design

✅ **Authentication Features:**
- JWT-based session management
- Telegram user profile in header
- Secure logout functionality
- Automatic token refresh

✅ **Enhanced Features:**
- Real-time activity monitoring
- Keyword management with modals
- Professional statistics cards
- Loading states and smooth transitions
- Better UX throughout

## Architecture

```
Telegram User → WebApp Button → Frontend (/webapp)
     ↓
Frontend reads initData → POST /api/auth/telegram-webapp/session
     ↓
Backend verifies HMAC → Creates/updates user → Returns JWT token
     ↓
Frontend stores JWT in localStorage → Redirects to /dashboard
     ↓
All API calls include JWT → Backend validates JWT → Returns user data
```

## Security Features

- **HMAC Signature Verification:** All Telegram initData is verified using your bot token
- **JWT Tokens:** Secure session management with expiring tokens
- **User Context:** Each user only sees their own data
- **Logout Support:** Users can securely end their session

## Next Steps

1. **Deploy both services** with all environment variables set
2. **Test the complete flow** from Telegram to dashboard
3. **Monitor logs** for any authentication issues
4. **Optional customizations:**
   - Customize JWT token expiration time
   - Add user roles and permissions
   - Add more Telegram user fields to the profile
   - Add session timeout warnings

Your users can now access the beautiful modern admin interface directly from Telegram with secure authentication! 🚀
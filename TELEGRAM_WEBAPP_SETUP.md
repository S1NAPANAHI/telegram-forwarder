# Telegram WebApp Integration Guide

This project is configured to open the modern admin UI as a Telegram WebApp.

## URLs
- Frontend: https://frontend-service-51uy.onrender.com
- Backend: https://backend-service-idry.onrender.com

## Frontend env
- NEXT_PUBLIC_API_URL=https://backend-service-idry.onrender.com

## Backend env
- TELEGRAM_BOT_TOKEN=<your_bot_token>

## Telegram Bot setup

### Option A: Persistent menu button (recommended)
Use setChatMenuButton so users can always open the panel from the bot menu.

curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Open Panel",
      "web_app": { "url": "https://frontend-service-51uy.onrender.com/webapp" }
    }
  }'

### Option B: /webapp command reply button
When handling /webapp, reply with an inline keyboard that opens the WebApp:

POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage
Body (JSON):
{
  "chat_id": "<CHAT_ID>",
  "text": "Open the admin panel:",
  "reply_markup": {
    "inline_keyboard": [[
      { "text": "🚀 Open Admin Panel", "web_app": { "url": "https://frontend-service-51uy.onrender.com/webapp" } }
    ]]
  }
}

## Flow
1) User taps WebApp button in Telegram → Telegram injects initData
2) Frontend /webapp posts initData to Backend /api/auth/telegram-webapp/session
3) Backend verifies signature with TELEGRAM_BOT_TOKEN
4) On success, frontend redirects to /dashboard (modern UI)

## Troubleshooting
- If UI opens outside Telegram: you clicked the URL in a browser; inside Telegram you get initData.
- If session fails: ensure TELEGRAM_BOT_TOKEN is set on backend and redeployed.
- If API calls fail: verify NEXT_PUBLIC_API_URL on frontend points to backend URL, then redeploy.


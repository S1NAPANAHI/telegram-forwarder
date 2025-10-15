# Hybrid Monitoring (Bot Admin + Client Non-Admin)

This document explains the architecture and setup for the hybrid system that supports:
- Bot API path for sources where the bot is admin (groups/channels)
- Client API path (gramJS) for sources where the bot isn’t admin

## Overview

- Admin sources: handled by the bot (node-telegram-bot-api), zero extra credentials required.
- Non-admin sources: handled by the client (gramJS) using a real Telegram user account.
- Both paths share the same: keywords, destinations, analytics, and logging.

## Components

- Bot Monitor: backend/bots/telegramBot.js
- Client Monitor (scaffolded): backend/bots/clientMonitor.js
- Monitoring Manager: backend/services/monitoringManager.js
- Auto-Promotion: backend/services/AutoPromoteService.js
- Discovery: backend/services/ChatDiscoveryService.js + routes/discovery.js
- Client Auth placeholders: backend/routes/clientAuth.js

## Data Flow

1) A source is added (Channels).
2) If bot is admin → monitor via bot.
3) If not admin → queued for client; once logged-in, client joins and monitors.
4) Messages matched against Keywords.
5) Matches forwarded to Destinations.
6) Logged into message_logs and analytics.

## Environment Variables

- TELEGRAM_BOT_TOKEN: Bot token (Bot API)
- TG_API_ID (client): from my.telegram.org
- TG_API_HASH (client): from my.telegram.org
- TG_PHONE (client): phone number with country code
- TG_2FA_PASSWORD (client): optional, only if enabled
- TG_SESSION (client): session string after first successful login

## Client Auth Endpoints (placeholders until creds are added)

- GET /api/client-auth/status → returns configured status
- POST /api/client-auth/init → initialize login (requires phone)
- POST /api/client-auth/code → submit SMS code
- POST /api/client-auth/2fa → submit 2FA password if needed

These endpoints are rate-limited and do not log secrets.

## Admin vs Non-Admin Behavior

- Admin: bot listens to `message` and `channel_post`. Requires privacy mode disabled for groups.
- Non-Admin: client (gramJS) reads from any joined channel/group. Requires user login and session.

## Keywords & Matching

- Supports: exact | contains | regex + case_sensitive
- Shared between bot and client paths
- Configure via Keywords page in the panel

## Destinations

- Telegram chats/channels where bot can send/copy messages
- Eitaa and website adapters planned

## Auto-Promotion to Channels

- When the bot detects a chat and confirms admin rights, it auto-promotes it to Channels for the current user.
- Your Channels page updates automatically (no manual adding required).

## Deployment Notes

- Without TG_API_ID/TG_API_HASH present, client monitor stays inactive with logs: "Client monitor skipped (missing creds)".
- Bot admin path always remains active.

## Security

- Do not log TG_PHONE, TG_SESSION, codes, or passwords.
- Store TG_SESSION securely in Render env after the first successful login.


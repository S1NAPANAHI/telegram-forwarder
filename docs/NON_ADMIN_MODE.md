# Non-Admin Mode (Client API)

This document explains how the system behaves and is configured when the bot is **not admin** in sources. In this mode, a Telegram **Client API** (gramJS) using a user account reads messages from channels/groups you can join.

## Requirements

- Telegram API credentials from https://my.telegram.org
  - TG_API_ID, TG_API_HASH
  - TG_PHONE (with country code)
  - TG_2FA_PASSWORD (optional; only if enabled)
- TG_SESSION (generated on first successful login)

## Login Flow (Placeholders Active)

- GET /api/client-auth/status → shows state (not_configured | awaiting_code | awaiting_2fa | logged_in)
- POST /api/client-auth/init → begin login (requires phone)
- POST /api/client-auth/code → submit SMS code
- POST /api/client-auth/2fa → submit 2FA password (if needed)

With placeholders, the system stays idle until credentials are provided.

## Data Flow

1) Client joins channels/groups as your user account
2) Client receives messages in real time
3) Messages are checked against Keywords
4) Matches are forwarded via your bot to Destinations
5) Activity is logged in Analytics

## Notes

- Appears as a normal user (indistinguishable from manual reading)
- Works for public and private channels/groups you can join
- Shares Keywords/Destinations/Analytics with Admin Mode
- Scales to hundreds of sources

## Security

- Do not log phone numbers, codes, 2FA, or TG_SESSION
- Store TG_SESSION in environment variables after generation


# Admin Mode (Bot API)

This document explains how the system behaves and is configured when the bot is **admin** in sources (groups/channels).

## Requirements

- Bot added as admin to the group/channel
- Privacy mode disabled in BotFather: `/setprivacy` → select bot → **Disable**
- Permissions: can read messages (groups) and post/copy messages (destinations)

## Data Flow

1) Bot receives `message` (groups) or `channel_post` (channels)
2) System checks message text/caption against Keywords
3) Matching messages are forwarded via `copyMessage` to Destinations
4) Activity is logged in Analytics

## Setup Steps

1) Add the bot as admin to your source channels/groups
2) In the web panel, add the channel (URL/@username/numeric ID)
3) Add keywords (exact | contains | regex; case-sensitive optional)
4) Add destinations (private chat/channel where bot can post)
5) Test by posting a message with a matching keyword

## Notes

- `copyMessage` preserves content and media
- `channel_post` handler is required for channels
- Discovery auto-saves chats to `discovered_chats`
- Auto-promotion moves admin chats into Channels automatically


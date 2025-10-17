# API Routes Documentation

This document provides an overview of the backend API routes, their purpose, and the corresponding route files.

## `auth.js`

Handles user authentication, registration, and session management.

- **`POST /api/auth/register`**: Register a new user.
- **`POST /api/auth/login-cookie`**: Log in a user and set an HTTP-only refresh token cookie.
- **`GET /api/auth/me`**: Get the currently authenticated user's profile.
- **`POST /api/auth/refresh`**: Refresh the access token using the refresh token cookie.
- **`POST /api/auth/logout`**: Log out the user and clear the refresh token.

## `channels.js`

Manages the source channels that the user wants to monitor.

- **`GET /api/channels`**: Get all channels for the authenticated user.
- **`POST /api/channels`**: Create a new channel.
- **`PUT /api/channels/:id`**: Update a channel.
- **`DELETE /api/channels/:id`**: Delete a channel.

## `keywords.js`

Manages the keywords used to filter messages.

- **`GET /api/keywords`**: Get all keywords for the authenticated user.
- **`POST /api/keywords`**: Create a new keyword.
- **`PUT /api/keywords/:id`**: Update a keyword.
- **`DELETE /api/keywords/:id`**: Delete a keyword.

## `destinations.js`

Manages the destination channels where forwarded messages are sent.

- **`GET /api/destinations`**: Get all destinations for the authenticated user.
- **`POST /api/destinations`**: Create a new destination.
- **`PUT /api/destinations/:id`**: Update a destination.
- **`DELETE /api/destinations/:id`**: Delete a destination.
- **`POST /api/destinations/:id/resolve`**: Manually resolve a destination's @username to a numeric chat ID.

## `logs.js`

Provides access to message logs.

- **`GET /api/logs`**: Get message logs for the authenticated user, with pagination.

## `analytics.js`

Provides analytics and statistics about the user's activity.

- **`GET /api/analytics/stats`**: Get comprehensive analytics stats.
- **`GET /api/analytics/activity`**: Get weekly activity data.
- **`GET /api/analytics/performance`**: Get detailed performance metrics.
- **`GET /api/analytics/channels`**: Get channel-wise analytics.

## `monitoring.js`

Controls the channel monitoring service.

- **`POST /api/monitoring/start/:channelId`**: Start monitoring a specific channel.
- **`POST /api/monitoring/stop/:channelId`**: Stop monitoring a specific channel.
- **`GET /api/monitoring/status`**: Get the status of all monitored channels for the user.
- **`POST /api/monitoring/refresh`**: Refresh monitoring for all channels.
- **`POST /api/monitoring/restart`**: Restart the entire monitoring manager.

## `settings.js`

Manages user-specific settings.

- **`GET /api/settings`**: Get the current user's settings.
- **`PUT /api/settings`**: Update the user's settings.

## `messages.js`

Handles real-time message feeds and message queues.

- **`GET /api/messages/feed`**: Get the real-time message feed for the authenticated user.
- **`GET /api/messages/queue`**: Get the message queue with status information.
- **`GET /api/messages/stats`**: Get message statistics.
- **`DELETE /api/messages/feed`**: Clear the message feed.
- **`POST /api/messages/retry/:messageId`**: Retry a failed message delivery.
- **`POST /api/messages/test`**: Create a test message for debugging.

## `telegram-webapp.js`

Handles authentication and other interactions with the Telegram WebApp.

- **`POST /api/telegram-webapp/language`**: Update the user's language preference.

## `bot.js`

Provides a webhook for the Telegram bot.

- **`POST /api/bot/webhook`**: The webhook endpoint for the Telegram bot to receive updates.
- **`GET /api/bot/status`**: Get the status of the bot.

## `discovery.js`

Manages the discovery of new Telegram chats.

- **`GET /api/discovery`**: Get all discovered chats with filtering.
- **`POST /api/discovery/scan`**: Trigger a full chat discovery.
- **`GET /api/discovery/status`**: Get the discovery status and statistics.
- **`GET /api/discovery/chats`**: Get discovered chats with pagination.
- **`POST /api/discovery/refresh`**: Refresh the admin status for all discovered chats.
- **`POST /api/discovery/:chatId/promote`**: Promote a discovered chat to a monitored channel.
- **`POST /api/discovery/bulk-promote`**: Promote multiple chats to channels.
- **`DELETE /api/discovery/:chatId`**: Remove a discovered chat.

## `autoPromote.js`

Handles the automatic promotion of discovered chats.

- **`POST /api/auto-promote`**: Manually trigger the auto-promotion service.
- **`GET /api/auto-promote/status`**: Get the status of the auto-promotion service.
- **`POST /api/promote/:chatId`**: Legacy endpoint to promote a specific chat.

## `clientAuth.js`

Manages the authentication of a Telegram client (user account).

- **`GET /api/client-auth/status`**: Get the status of the Telegram client authentication.
- **`POST /api/client-auth/init`**: Initialize the client authentication process.
- **`POST /api/client-auth/code`**: Submit the authentication code.
- **`POST /api/client-auth/2fa`**: Submit the two-factor authentication password.

## `authLinkTelegram.js`

Links a Telegram account to a user's account.

- **`POST /api/auth/link-telegram`**: Link a Telegram account to the authenticated user's account.

## `adminMigrate.js`

Provides admin-level tools for migrating user data.

- **`POST /api/admin/migrate-user-content`**: Migrate content from one user to another.

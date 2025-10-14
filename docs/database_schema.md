# Database Schema Documentation

This document outlines the current database schema for the Telegram Forwarder Bot project. The project utilizes MongoDB as its primary database, with Mongoose as the ODM (Object Data Modeling) library for Node.js.

## Database Connection

The database connection is established using Mongoose, as configured in `backend/database/connection.js`.

## Collections (Models)

The following collections and their respective schemas are defined:

### 1. User

Represents a user of the system, supporting both web authentication and bot-specific interactions.

*   **`email`**: `String`, `required: false`, `unique: true`, `sparse: true` (for web users)
*   **`password`**: `String`, `required: false` (for web users)
*   **`telegramId`**: `String`, `required: false`, `unique: true`, `sparse: true` (for bot users)
*   **`username`**: `String`
*   **`firstName`**: `String`
*   **`lastName`**: `String`
*   **`language`**: `String`, `default: 'fa'`
*   **`subscription`**: `Object`
    *   **`plan`**: `String`, `enum: ['free', 'premium', 'enterprise']`, `default: 'free'`
    *   **`keywordsLimit`**: `Number`, `default: 10`
    *   **`channelsLimit`**: `Number`, `default: 5`
    *   **`expiresAt`**: `Date`
*   **`isActive`**: `Boolean`, `default: true`
*   **`createdAt`**: `Date`, `default: Date.now`
*   **`lastLogin`**: `Date` (for web users)
*   **`lastActive`**: `Date`, `default: Date.now` (for bot users)

**Indexes:**
*   `telegramId`: `unique`, `sparse`
*   `email`: `unique`, `sparse`
*   `isActive`

### 2. BotSession

Stores temporary session data for bot interactions, enabling multi-step conversations.

*   **`userId`**: `ObjectId`, `ref: 'User'`, `required: true`
*   **`currentState`**: `String`, `enum: ['idle', 'awaiting_keyword', 'awaiting_channel', 'awaiting_destination', 'configuring_settings']`, `default: 'idle'`
*   **`context`**: `Object`
    *   **`action`**: `String`
    *   **`tempData`**: `Mixed`
*   **`lastInteraction`**: `Date`, `default: Date.now` (TTL index: expires after 1 hour of inactivity)
*   **`messageCount`**: `Number`, `default: 0`

**Indexes:**
*   `lastInteraction`: TTL (3600 seconds)
*   `userId`: `unique`

### 3. Channel

Defines a source channel from which messages are monitored and forwarded.

*   **`userId`**: `ObjectId`, `ref: 'User'`, `required: true`
*   **`platform`**: `String`, `enum: ['telegram', 'eitaa', 'website']`, `required: true`
*   **`channelUrl`**: `String`, `required: true`
*   **`channelName`**: `String`, `required: true`
*   **`isActive`**: `Boolean`, `default: true`
*   **`lastChecked`**: `Date`, `default: Date.now`
*   **`credentials`**: `Object`
    *   **`phone`**: `String`
    *   **`password`**: `String`
    *   **`sessionData`**: `String`
*   **`monitoringSettings`**: `Object`
    *   **`checkInterval`**: `Number`, `default: 30000` (30 seconds)
    *   **`maxMessagesPerCheck`**: `Number`, `default: 50`
*   **`createdAt`**: `Date`, `default: Date.now`

**Indexes:**
*   `userId`, `platform`
*   `isActive`, `platform`

### 4. Destination

Specifies a target chat or channel where messages are forwarded.

*   **`userId`**: `ObjectId`, `ref: 'User'`, `required: true`
*   **`type`**: `String`, `enum: ['private_chat', 'group', 'channel']`, `required: true`
*   **`platform`**: `String`, `enum: ['telegram', 'eitaa']`, `required: true`
*   **`chatId`**: `String`, `required: true`
*   **`name`**: `String`, `required: true`
*   **`isActive`**: `Boolean`, `default: true`
*   **`forwardSettings`**: `Object`
    *   **`includeMedia`**: `Boolean`, `default: true`
    *   **`includeCaption`**: `Boolean`, `default: true`
    *   **`addPrefix`**: `Boolean`, `default: true`
    *   **`prefixText`**: `String`, `default: '🔔 '`
*   **`createdAt`**: `Date`, `default: Date.now`

**Indexes:**
*   `userId`, `isActive`

### 5. Keyword

Defines keywords used for filtering and forwarding messages.

*   **`userId`**: `ObjectId`, `ref: 'User'`, `required: true`
*   **`keyword`**: `String`, `required: true`, `trim: true`
*   **`isActive`**: `Boolean`, `default: true`
*   **`caseSensitive`**: `Boolean`, `default: false`
*   **`exactMatch`**: `Boolean`, `default: false`
*   **`matchCount`**: `Number`, `default: 0`
*   **`createdAt`**: `Date`, `default: Date.now`

**Indexes:**
*   `userId`, `keyword`: `unique`
*   `userId`, `isActive`

### 6. MessageLog

Logs information about processed and forwarded messages.

*   **`userId`**: `ObjectId`, `ref: 'User'`, `required: true`
*   **`keywordId`**: `ObjectId`, `ref: 'Keyword'`, `required: true`
*   **`channelId`**: `ObjectId`, `ref: 'Channel'`
*   **`originalMessage`**: `Object`
    *   **`messageId`**: `String`
    *   **`text`**: `String`
    *   **`platform`**: `String`
    *   **`channelName`**: `String`
    *   **`timestamp`**: `Date`
*   **`matchedText`**: `String`, `required: true`
*   **`forwardedTo`**: `Array` of `Object`
    *   **`destinationId`**: `ObjectId`, `ref: 'Destination'`
    *   **`status`**: `String`, `enum: ['success', 'failed', 'pending']`
    *   **`error`**: `String`
    *   **`timestamp`**: `Date`
*   **`status`**: `String`, `enum: ['processed', 'duplicate', 'error', 'filtered']`, `default: 'processed'`
*   **`duplicateOf`**: `ObjectId`, `ref: 'MessageLog'`
*   **`processingTime`**: `Number` (in milliseconds)
*   **`createdAt`**: `Date`, `default: Date.now` (TTL index: expires after 30 days)

**Indexes:**
*   `createdAt`: TTL (2592000 seconds)
*   `userId`, `status`
*   `originalMessage.messageId`, `platform`

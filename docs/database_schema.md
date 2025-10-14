# Database Schema Documentation (Supabase - PostgreSQL)

This document outlines the current database schema for the Telegram Forwarder Bot project, utilizing Supabase (PostgreSQL).

## Tables

### 1. `users`

Represents a user of the system, including authentication and subscription details.

*   **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
*   **`email`**: `TEXT` (Unique, Optional)
*   **`password`**: `TEXT` (Handled by Supabase Auth, Optional)
*   **`telegram_id`**: `BIGINT` (Unique, Optional) - *Added for Telegram bot integration*
*   **`telegram_username`**: `TEXT` (Optional) - *Added for Telegram bot integration*
*   **`username`**: `TEXT` (Optional)
*   **`first_name`**: `TEXT` (Optional)
*   **`last_name`**: `TEXT` (Optional)
*   **`language`**: `VARCHAR(2)` (Default: `'fa'`)
*   **`subscription_plan`**: `TEXT` (Default: `'free'`)
*   **`keywords_limit`**: `INT` (Default: `10`)
*   **`channels_limit`**: `INT` (Default: `5`)
*   **`subscription_expires_at`**: `TIMESTAMP WITH TIME ZONE` (Optional)
*   **`is_active`**: `BOOLEAN` (Default: `true`)
*   **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
*   **`last_login`**: `TIMESTAMP WITH TIME ZONE` (Optional)

**Indexes:**
*   `idx_users_telegram_id` on `telegram_id`

### 2. `channels`

Defines a source channel from which messages are monitored and forwarded.

*   **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
*   **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
*   **`platform`**: `TEXT` (e.g., `'telegram'`, `'eitaa'`, `'website'`, Not Null)
*   **`channel_url`**: `TEXT` (Not Null)
*   **`channel_name`**: `TEXT` (Not Null)
*   **`is_active`**: `BOOLEAN` (Default: `true`)
*   **`last_checked`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
*   **`check_interval`**: `INT` (Default: `30000` milliseconds)
*   **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 3. `keywords`

Defines keywords used for filtering and forwarding messages.

*   **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
*   **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
*   **`keyword`**: `TEXT` (Not Null, Unique with `user_id`)
*   **`is_active`**: `BOOLEAN` (Default: `true`)
*   **`case_sensitive`**: `BOOLEAN` (Default: `false`)
*   **`exact_match`**: `BOOLEAN` (Default: `false`)
*   **`match_count`**: `INT` (Default: `0`)
*   **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

**Unique Constraints:**
*   `(user_id, keyword)`

### 4. `destinations`

Specifies a target chat or channel where messages are forwarded.

*   **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
*   **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
*   **`type`**: `TEXT` (e.g., `'private_chat'`, `'group'`, `'channel'`, Not Null)
*   **`platform`**: `TEXT` (e.g., `'telegram'`, `'eitaa'`, Not Null)
*   **`chat_id`**: `TEXT` (Not Null)
*   **`name`**: `TEXT` (Not Null)
*   **`is_active`**: `BOOLEAN` (Default: `true`)
*   **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 5. `message_logs`

Logs information about processed and forwarded messages.

*   **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
*   **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
*   **`keyword_id`**: `UUID` (Foreign Key to `keywords.id`, `ON DELETE SET NULL`, Optional)
*   **`channel_id`**: `UUID` (Foreign Key to `channels.id`, `ON DELETE SET NULL`, Optional)
*   **`original_message_id`**: `TEXT` (Optional)
*   **`original_message_text`**: `TEXT` (Optional)
*   **`matched_text`**: `TEXT` (Not Null)
*   **`status`**: `TEXT` (Default: `'processed'`)
*   **`processing_time_ms`**: `INT` (Optional)
*   **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

**Indexes:**
*   `idx_logs_created_at` on `created_at` (Descending)

## Functions

### `increment_match_count(keyword_id UUID)`

A PostgreSQL function to increment the `match_count` for a given keyword.

```sql
CREATE OR REPLACE FUNCTION increment_match_count(keyword_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE keywords
  SET match_count = match_count + 1
  WHERE id = keyword_id;
END;
$$;
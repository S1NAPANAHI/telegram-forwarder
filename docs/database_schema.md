# Database Schema Documentation (Supabase - PostgreSQL)

This document outlines the current database schema for the Telegram Forwarder Bot project, utilizing Supabase (PostgreSQL).

## Tables

### 1. `users`

Represents a user of the system, including authentication and subscription details.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`telegram_id`**: `VARCHAR(50)` (Unique)
- **`username`**: `VARCHAR(100)` (Not Null)
- **`email`**: `VARCHAR(255)` (Unique)
- **`password_hash`**: `VARCHAR(255)`
- **`first_name`**: `VARCHAR(100)`
- **`last_name`**: `VARCHAR(100)`
- **`phone`**: `VARCHAR(20)`
- **`language`**: `VARCHAR(10)` (Default: `'fa'`)
- **`timezone`**: `VARCHAR(50)` (Default: `'Asia/Tehran'`)
- **`role`**: `VARCHAR(20)` (Default: `'user'`) - e.g., `user`, `admin`, `premium`
- **`subscription_type`**: `VARCHAR(20)` (Default: `'free'`) - e.g., `free`, `basic`, `premium`
- **`subscription_expires_at`**: `TIMESTAMP WITH TIME ZONE`
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`is_verified`**: `BOOLEAN` (Default: `false`)
- **`email_verified_at`**: `TIMESTAMP WITH TIME ZONE`
- **`phone_verified_at`**: `TIMESTAMP WITH TIME ZONE`
- **`registered_via`**: `VARCHAR(20)` (Default: `'web'`) - e.g., `web`, `telegram_webapp`, `telegram_bot`
- **`last_login_at`**: `TIMESTAMP WITH TIME ZONE`
- **`login_count`**: `INTEGER` (Default: `0`)
- **`settings`**: `JSONB` (Default: `{}`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 2. `user_sessions`

Stores user session information for authentication.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`token_hash`**: `VARCHAR(255)` (Not Null)
- **`device_info`**: `JSONB` (Default: `{}`)
- **`ip_address`**: `INET`
- **`user_agent`**: `TEXT`
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`expires_at`**: `TIMESTAMP WITH TIME ZONE` (Not Null)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 3. `keywords`

Defines keywords used for filtering and forwarding messages.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`keyword`**: `TEXT` (Not Null)
- **`description`**: `TEXT`
- **`category`**: `VARCHAR(100)`
- **`case_sensitive`**: `BOOLEAN` (Default: `false`)
- **`exact_match`**: `BOOLEAN` (Default: `false`)
- **`regex_pattern`**: `TEXT`
- **`priority`**: `INTEGER` (Default: `1`)
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`match_count`**: `INTEGER` (Default: `0`)
- **`last_matched_at`**: `TIMESTAMP WITH TIME ZONE`
- **`tags`**: `TEXT[]`
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 4. `channels`

Defines a source channel from which messages are monitored.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`platform`**: `VARCHAR(20)` (Not Null)
- **`channel_name`**: `VARCHAR(200)` (Not Null)
- **`channel_url`**: `TEXT` (Not Null)
- **`channel_id`**: `VARCHAR(100)`
- **`description`**: `TEXT`
- **`category`**: `VARCHAR(100)`
- **`language`**: `VARCHAR(10)` (Default: `'fa'`)
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`is_verified`**: `BOOLEAN` (Default: `false`)
- **`monitoring_enabled`**: `BOOLEAN` (Default: `true`)
- **`last_message_at`**: `TIMESTAMP WITH TIME ZONE`
- **`message_count`**: `INTEGER` (Default: `0`)
- **`error_count`**: `INTEGER` (Default: `0`)
- **`last_error`**: `TEXT`
- **`last_error_at`**: `TIMESTAMP WITH TIME ZONE`
- **`settings`**: `JSONB` (Default: `{}`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 5. `destinations`

Specifies a target chat or channel where messages are forwarded.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`name`**: `VARCHAR(200)` (Not Null)
- **`type`**: `VARCHAR(20)` (Not Null)
- **`platform`**: `VARCHAR(20)` (Not Null)
- **`chat_id`**: `VARCHAR(100)`
- **`webhook_url`**: `TEXT`
- **`email_address`**: `VARCHAR(255)`
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`format_template`**: `TEXT`
- **`settings`**: `JSONB` (Default: `{}`)
- **`success_count`**: `INTEGER` (Default: `0`)
- **`error_count`**: `INTEGER` (Default: `0`)
- **`last_used_at`**: `TIMESTAMP WITH TIME ZONE`
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 6. `keyword_channels`

Many-to-many relationship between keywords and channels.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`keyword_id`**: `UUID` (Foreign Key to `keywords.id`, `ON DELETE CASCADE`)
- **`channel_id`**: `UUID` (Foreign Key to `channels.id`, `ON DELETE CASCADE`)
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 7. `keyword_destinations`

Many-to-many relationship between keywords and destinations.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`keyword_id`**: `UUID` (Foreign Key to `keywords.id`, `ON DELETE CASCADE`)
- **`destination_id`**: `UUID` (Foreign Key to `destinations.id`, `ON DELETE CASCADE`)
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 8. `message_logs`

Logs information about processed and forwarded messages.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`keyword_id`**: `UUID` (Foreign Key to `keywords.id`, `ON DELETE SET NULL`)
- **`channel_id`**: `UUID` (Foreign Key to `channels.id`, `ON DELETE SET NULL`)
- **`destination_id`**: `UUID` (Foreign Key to `destinations.id`, `ON DELETE SET NULL`)
- **`original_message_id`**: `VARCHAR(100)`
- **`forwarded_message_id`**: `VARCHAR(100)`
- **`original_message_text`**: `TEXT`
- **`formatted_message_text`**: `TEXT`
- **`matched_keyword`**: `TEXT`
- **`match_type`**: `VARCHAR(20)`
- **`processing_time_ms`**: `INTEGER`
- **`status`**: `VARCHAR(20)` (Default: `'pending'`)
- **`error_message`**: `TEXT`
- **`duplicate_of`**: `UUID` (Foreign Key to `message_logs.id`)
- **`metadata`**: `JSONB` (Default: `{}`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`processed_at`**: `TIMESTAMP WITH TIME ZONE`
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 9. `message_filters`

Defines filters for advanced message filtering.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`name`**: `VARCHAR(200)` (Not Null)
- **`description`**: `TEXT`
- **`filter_type`**: `VARCHAR(20)` (Not Null)
- **`filter_value`**: `TEXT` (Not Null)
- **`is_active`**: `BOOLEAN` (Default: `true`)
- **`apply_to`**: `VARCHAR(20)` (Default: `'all'`)
- **`target_id`**: `UUID`
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 10. `notifications`

Stores user notifications and alerts.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`type`**: `VARCHAR(50)` (Not Null)
- **`title`**: `VARCHAR(200)` (Not Null)
- **`message`**: `TEXT` (Not Null)
- **`is_read`**: `BOOLEAN` (Default: `false`)
- **`is_sent`**: `BOOLEAN` (Default: `false`)
- **`priority`**: `VARCHAR(20)` (Default: `'normal'`)
- **`delivery_method`**: `VARCHAR(20)` (Default: `'in_app'`)
- **`scheduled_for`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`sent_at`**: `TIMESTAMP WITH TIME ZONE`
- **`metadata`**: `JSONB` (Default: `{}`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 11. `rate_limits`

Tracks API rate limiting information.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE CASCADE`)
- **`ip_address`**: `INET`
- **`endpoint`**: `VARCHAR(200)` (Not Null)
- **`request_count`**: `INTEGER` (Default: `1`)
- **`window_start`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`window_end`**: `TIMESTAMP WITH TIME ZONE`
- **`is_blocked`**: `BOOLEAN` (Default: `false`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 12. `audit_logs`

Logs actions for security and debugging purposes.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`user_id`**: `UUID` (Foreign Key to `users.id`, `ON DELETE SET NULL`)
- **`action`**: `VARCHAR(100)` (Not Null)
- **`resource_type`**: `VARCHAR(50)`
- **`resource_id`**: `UUID`
- **`old_values`**: `JSONB`
- **`new_values`**: `JSONB`
- **`ip_address`**: `INET`
- **`user_agent`**: `TEXT`
- **`metadata`**: `JSONB` (Default: `{}`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

### 13. `system_settings`

Stores system-wide settings and configuration.

- **`id`**: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- **`key`**: `VARCHAR(100)` (Unique, Not Null)
- **`value`**: `JSONB` (Not Null)
- **`description`**: `TEXT`
- **`is_public`**: `BOOLEAN` (Default: `false`)
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` (Default: `NOW()`)

## Views

### 1. `active_user_stats`

Provides statistics about active users, including counts of their keywords, channels, destinations, and recent messages.

### 2. `daily_message_stats`

Provides daily statistics about messages, including total, successful, and failed message counts, as well as the number of active users and average processing time.

## Functions

### 1. `update_updated_at_column()`

A trigger function that automatically updates the `updated_at` timestamp on tables when a row is updated.

### 2. `get_user_quota_usage(user_uuid UUID)`

Returns a JSON object with the current usage statistics for a user, including the number of keywords, channels, and destinations used, as well as message counts for the current day and month.

## Row Level Security (RLS)

Row Level Security is enabled for the `users`, `keywords`, `channels`, `destinations`, `message_logs`, and `notifications` tables to ensure that users can only access and modify their own data.

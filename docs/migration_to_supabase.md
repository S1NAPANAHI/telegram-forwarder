# Migration Guide: From MongoDB to Supabase

This document provides a detailed, step-by-step plan to migrate the Telegram Forwarder Bot from a MongoDB-based backend to a Supabase-powered one.

## Phase 1: Supabase Project Setup & Initial Configuration

**Goal:** Prepare your Supabase environment and update the local project configuration.

*   **Step 1.1: Create a Supabase Project**
    1.  Go to [supabase.com](https://supabase.com) and create a new account or log in.
    2.  Create a new project. Make sure to save your **Project URL**, **anon key**, and **service_role key**.

*   **Step 1.2: Install Supabase Client**
    In your `backend` directory, install the Supabase JavaScript client library:
    ```bash
    cd backend
    npm install @supabase/supabase-js
    ```

*   **Step 1.3: Update Environment Variables**
    In your root `.env` file, comment out the MongoDB variables and add your Supabase credentials:
    ```env
    # .env

    # MONGODB_URI=... (comment out or remove)

    # Supabase
    SUPABASE_URL=your-supabase-project-url
    SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Use this for server-side operations
    ```

## Phase 2: Database Schema Migration

**Goal:** Recreate your database structure in Supabase's PostgreSQL database.

*   **Step 2.1: Open the Supabase SQL Editor**
    In your Supabase project dashboard, navigate to the "SQL Editor" section.

*   **Step 2.2: Create Tables**
    Execute the following SQL scripts in the editor to create the tables corresponding to your Mongoose models.

    **Users Table:**
    ```sql
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE,
      password TEXT, -- Will be handled by Supabase Auth
      telegram_id TEXT UNIQUE,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      language VARCHAR(2) DEFAULT 'fa',
      subscription_plan TEXT DEFAULT 'free',
      keywords_limit INT DEFAULT 10,
      channels_limit INT DEFAULT 5,
      subscription_expires_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE
    );
    ```

    **Channels Table:**
    ```sql
    CREATE TABLE channels (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      channel_url TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      check_interval INT DEFAULT 30000,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ```

    **Keywords Table:**
    ```sql
    CREATE TABLE keywords (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      keyword TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      case_sensitive BOOLEAN DEFAULT false,
      exact_match BOOLEAN DEFAULT false,
      match_count INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, keyword)
    );
    ```

    **Destinations Table:**
    ```sql
    CREATE TABLE destinations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      platform TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ```

    **Message Logs Table:**
    ```sql
    CREATE TABLE message_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
      channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
      original_message_id TEXT,
      original_message_text TEXT,
      matched_text TEXT NOT NULL,
      status TEXT DEFAULT 'processed',
      processing_time_ms INT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    -- Create an index for faster queries on recent logs
    CREATE INDEX idx_logs_created_at ON message_logs(created_at DESC);
    ```

## Phase 3: Backend Refactoring

**Goal:** Replace all Mongoose and MongoDB-related code with the Supabase client.

*   **Step 3.1: Create a Supabase Client Instance**
    Create a new file `backend/database/supabase.js`:
    ```javascript
    // backend/database/supabase.js
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend

    const supabase = createClient(supabaseUrl, supabaseKey);

    module.exports = supabase;
    ```

*   **Step 3.2: Remove MongoDB Connection**
    In `backend/server.js`, remove the `connectDB` and `mongoose.connection.once` logic.

*   **Step 3.3: Refactor Services and Routes**
    Go through each file in `backend/services` and `backend/routes` and replace Mongoose queries with Supabase queries.

    **Example: Refactoring `KeywordService.js`**

    *Before (Mongoose):*
    ```javascript
    const Keyword = require('../models/Keyword');
    // ...
    static async addKeyword(userId, keywordData) {
      const keywordCount = await Keyword.countDocuments({ userId, isActive: true });
      // ... limit check
      const newKeyword = new Keyword({ userId, ...keywordData });
      await newKeyword.save();
      return newKeyword;
    }
    ```

    *After (Supabase):*
    ```javascript
    const supabase = require('../database/supabase');
    // ...
    static async addKeyword(userId, keywordData) {
      const { count, error: countError } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);
      // ... limit check

      const { data, error } = await supabase
        .from('keywords')
        .insert([{ user_id: userId, ...keywordData }])
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    ```
    **Apply this pattern to all database interactions.**

## Phase 4: Authentication Migration

**Goal:** Replace the custom JWT authentication with Supabase Auth.

*   **Step 4.1: Refactor Registration Route (`routes/auth.js`)**
    Use Supabase's `auth.signUp` method. This will handle password hashing and user creation securely.
    ```javascript
    // routes/auth.js
    const supabase = require('../database/supabase');
    // ...
    router.post('/register', async (req, res) => {
      const { email, password, username } = req.body;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username } // You can store additional user metadata here
        }
      });

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json({ message: 'User created. Please check your email for verification.', user: data.user });
    });
    ```

*   **Step 4.2: Refactor Login Route**
    Use Supabase's `auth.signInWithPassword` method.
    ```javascript
    // routes/auth.js
    router.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return res.status(400).json({ error: error.message });
      res.json({ token: data.session.access_token, user: data.user });
    });
    ```

*   **Step 4.3: Update Auth Middleware**
    The `auth` middleware needs to validate the JWT provided by Supabase.
    ```javascript
    // middleware/auth.js
    const supabase = require('../database/supabase');

    module.exports = async function (req, res, next) {
      const token = req.header('x-auth-token');
      if (!token) return res.status(401).send('Access denied. No token provided.');

      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw new Error(error.message);

        req.user = user;
        next();
      } catch (ex) {
        res.status(400).send('Invalid token.');
      }
    };
    ```

## Phase 5: Data Migration (Optional)

**Goal:** Move existing data from MongoDB to Supabase.

*   **Step 5.1: Export Data from MongoDB**
    Use `mongoexport` or a script to export each collection to a JSON or CSV file.
    ```bash
    mongoexport --uri="<your_mongodb_uri>" --collection=users --out=users.json --jsonArray
    ```

*   **Step 5.2: Write an Import Script**
    Create a Node.js script to read the exported files and insert the data into Supabase. You will need to handle mapping `_id` to the new foreign key relationships (`user_id`, etc.).

## Phase 6: Deployment and Cleanup

**Goal:** Update the deployment configuration.

*   **Step 6.1: Update `docker-compose.yml`**
    Remove the `mongodb` service from your `docker-compose.yml` file. Supabase is a cloud service, so you no longer need to host the database yourself.
    ```yaml
    # docker-compose.yml
    services:
      # ... (frontend, backend, redis, nginx)
      # REMOVE the mongodb service block
    ```

*   **Step 6.2: Remove Old Dependencies**
    Uninstall Mongoose and related packages from `backend/package.json`.
    ```bash
    cd backend
    npm uninstall mongoose bcryptjs jsonwebtoken
    ```

*   **Step 6.3: Remove Model Files**
    Delete the entire `backend/models` directory.

## Phase 7: Final Testing

**Goal:** Ensure the application works as expected with the new backend.

*   **Manual Testing Checklist:**
    - [ ] Can you register a new user?
    - [ ] Can you log in and log out?
    - [ ] Are you able to add, view, and delete keywords, channels, and destinations?
    - [ ] Does the monitoring service start correctly?
    - [ ] Are messages being forwarded when a keyword is matched?
    - [ ] Are the activity logs on the dashboard being populated correctly?
    - [ ] Do the AI features (smart filtering, duplicate detection) still work?

This migration is a significant undertaking but will result in a more modern, scalable, and feature-rich backend powered by Supabase.

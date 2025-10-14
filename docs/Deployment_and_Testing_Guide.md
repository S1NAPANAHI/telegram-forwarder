# Deployment and Testing Guide

This guide provides step-by-step instructions for deploying and testing the Telegram Keyword Bot application.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker:** [Get Docker](https://docs.docker.com/get-docker/)
- **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Supabase Project:** Ensure you have a Supabase project set up and the database schema migrated as per the [Migration Guide](./migration_to_supabase.md).

## 2. Configuration

The application uses a `.env` file for configuration. This file contains sensitive information and should **never** be committed to version control.

1.  **Create the `.env` file:** In the root directory of the project, create a file named `.env`.

2.  **Add the following variables:** Copy the contents of `.env.example` (if it exists) or use the following template and fill in your actual credentials:

    ```
    # Supabase
    SUPABASE_URL=your-supabase-project-url
    SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

    # Redis
    REDIS_URL=redis://redis:6379

    # Telegram
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

    # Eitaa (if using unofficial API)
    EITAA_PHONE=your_phone_number
    EITAA_PASSWORD=your_password

    # OpenAI
    OPENAI_API_KEY=your_openai_api_key

    # Server
    PORT=5000
    NODE_ENV=production

    # Rate Limiting
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100
    ```

## 3. Deployment

The application is deployed using Docker Compose, which orchestrates the frontend, backend, Redis, and other services.

1.  **Open a terminal** in the root directory of the project.

2.  **Build and start the services:** Run the following command:

    ```bash
    docker-compose up --build -d
    ```

    - `--build`: This flag forces Docker to rebuild the images.
    - `-d`: This flag runs the containers in detached mode (in the background).

3.  **Access the application:**
    - The frontend will be available at [http://localhost:80](http://localhost:80).
    - The backend API will be available at [http://localhost:5000](http://localhost:5000).

4.  **To stop the application:** Run the following command:

    ```bash
    docker-compose down
    ```

## 3.1. Render Deployment

For cloud deployment on Render, follow these steps:

### 3.1.1. `render.yaml` Configuration

Create a `render.yaml` file in your project root with the following content:

```yaml
services:
  - type: web
    name: telegram-forwarder-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: |
      cd backend
      npm install
      # Install system dependencies for Puppeteer
      apt-get update
      apt-get install -y chromium-browser
      # Install Chrome browser for Puppeteer
      npx puppeteer browsers install chrome --path ./chrome-cache
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
        value: false
      - key: PUPPETEER_CACHE_DIR
        value: ./chrome-cache
```

### 3.1.2. Environment Variables

Ensure the following environment variables are set in your Render backend service settings:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
PORT=10000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
TELEGRAM_BOT_TOKEN=your-bot-token
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### 3.1.3. Dockerfile for Backend

The `Dockerfile.backend` has been updated to include necessary Chrome installations for Puppeteer. Ensure your `Dockerfile.backend` matches the following:

```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY backend/ ./

# Install Puppeteer browsers
RUN npx puppeteer browsers install chrome

EXPOSE 10000

CMD ["npm", "start"]
```

### 3.1.4. Telegram Bot Webhook

For the Telegram bot to receive updates in a production environment, it's recommended to set a webhook. Replace `<YOUR_BOT_TOKEN>` and `https://your-backend-url.onrender.com` with your actual bot token and backend service URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url": "https://your-backend-url.onrender.com/api/telegram/webhook"}'
```

### 3.1.5. Puppeteer Configuration

The backend includes a `backend/config/puppeteer.js` file that dynamically configures Puppeteer for production environments, attempting to use system Chrome if available or falling back to bundled Chromium. This ensures Eitaa monitoring functions correctly on Render.


## 4. Testing

### Eitaa Login

When you start monitoring an Eitaa channel for the first time, you will need to manually enter a verification code. Please refer to the [Eitaa Login Guide](./Eitaa_Login_Guide.md) for detailed instructions.

### Backend Tests

A sample test file is provided at `backend/test.js`. To run the tests:

1.  **Exec into the backend container:**

    ```bash
    docker-compose exec backend sh
    ```

2.  **Run the test file:**

    ```bash
    node test.js
    ```

It is highly recommended to expand the test suite with more comprehensive unit and integration tests.

### Manual Testing Checklist

After deploying the application, perform the following checks to ensure everything is working correctly:

- [ ] **User Registration:** Can you create a new user account?
- [ ] **User Login:** Can you log in with the newly created account?
- [ ] **Dashboard:** Does the dashboard load correctly and display the new stats?
- [ ] **Keyword Management:** Can you add and delete keywords?
- [ ] **Channel Management:** Can you add a new channel to monitor?
- [ ] **Destination Management:** Can you add a destination to forward messages to?
- [ ] **Monitoring:** Start monitoring a channel. Does the status update correctly?
- [ ] **Forwarding:** Post a message in the monitored channel that contains one of your keywords. Is the message forwarded to your destination?
- [ ] **Logs:** Does the forwarded message appear in the logs page and the recent activity feed on the dashboard?

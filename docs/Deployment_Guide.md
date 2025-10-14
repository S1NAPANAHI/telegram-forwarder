# Deployment Guide: Telegram Keyword Bot

This guide provides instructions for deploying and running the Telegram Keyword Bot project, both locally for development and in a cloud environment like Render for production.

## 1. Project Overview

The project consists of several interconnected components:
*   **`frontend/`**: A Next.js application providing a web interface for managing keywords, channels, and destinations.
*   **`backend/`**: A Node.js/Express API server that handles user authentication, data management, and interacts with the bot services.
*   **`bots/`**: Contains the logic for interacting with Telegram and Eitaa platforms to monitor channels and forward messages.
*   **`scraper/`**: Modules for scraping news from websites.
*   **`ai-services/`**: AI-powered filtering and information extraction.
*   **`docker-compose.yml` & `Dockerfile`s**: Configuration for containerizing the application.

The database (PostgreSQL) is hosted separately on Supabase.

## 2. Local Development Setup

To run the entire application on your local machine:

### 2.1. Prerequisites

*   Node.js (v18 or higher) and npm installed.
*   Git installed.
*   Supabase project with a configured PostgreSQL database (as set in your `.env`).
*   Telegram Bot Token (from BotFather).

### 2.2. Clone the Repository

```bash
git clone <your-repository-url>
cd telegram-forwarder-bot
```

### 2.3. Configure Environment Variables

Create a `.env` file in the project root (`telegram-forwarder-bot/.env`) and populate it with your specific values.

```dotenv
# Supabase
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis
REDIS_URL=redis://localhost:6379 # Or your Redis instance URL

# Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE

# Eitaa (if using unofficial API)
EITAA_PHONE=your_eitaa_phone_number
EITAA_PASSWORD=your_eitaa_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
**Note:** Your Supabase credentials should already be correctly set if you followed the previous steps.

### 2.4. Install Dependencies

Navigate to the `backend` and `frontend` directories and install their respective dependencies.

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2.5. Start the Application Components

You'll need to start the backend, frontend, and potentially the bot processes.

#### 2.5.1. Start Redis (Optional, but recommended for rate limiting and other features)

If you are using Redis (as indicated by `REDIS_URL` in `.env`), you'll need to have a Redis server running locally or accessible. You can run Redis via Docker:

```bash
docker run --name some-redis -p 6379:6379 -d redis
```

#### 2.5.2. Start the Backend Server

The backend server will initialize the monitoring manager, which in turn starts the Telegram and Eitaa bots.

```bash
cd backend
npm start # Or node server.js if 'start' script is not defined
```
Look for console output indicating "Server running on port 5000". Also, messages like "Started monitoring Telegram channel" will confirm bot initialization.

#### 2.5.3. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```
This will typically start the frontend on `http://localhost:3000`.

### 2.6. Access the Application

*   **Frontend:** Open your web browser and navigate to `http://localhost:3000`.
*   **Backend API:** The API will be available at `http://localhost:5000/api/...`.

## 3. Cloud Deployment with Render

Render is a cloud platform that allows you to host web services, background workers, and more. Your Docker setup makes deployment to Render straightforward.

### 3.1. Render Services

You would typically deploy your project to Render using the following services:

*   **Web Service (Backend):** For your `backend/` application. Render can build your `Dockerfile.backend` and expose the API.
*   **Web Service (Frontend):** For your `frontend/` application. Render can build your `Dockerfile.frontend` or directly deploy your Next.js app.
*   **Background Workers (Bots/Scrapers):** If your bot logic or scrapers are long-running or need to be separate from the main API, you might deploy them as Render Background Workers. However, in your current setup, the `monitoringManager` in the backend already handles starting the bots.
*   **Redis (Optional):** Render offers managed Redis instances if you choose not to use a self-hosted one.

### 3.2. Deployment Steps (High-Level)

1.  **Connect to Git:** Link your GitHub/GitLab repository to Render.
2.  **Configure Services:** For each component (backend, frontend), create a new Render service.
    *   Specify the build command (e.g., `npm install && npm run build`).
    *   Specify the start command (e.g., `npm start`).
    *   Set environment variables (matching your `.env` file) directly in Render's dashboard.
3.  **Build and Deploy:** Render will automatically build and deploy your services.

### 3.3. Key Considerations for Cloud Deployment

*   **Environment Variables:** Ensure all sensitive information (API keys, tokens, database credentials) are set as environment variables in Render, not hardcoded in your repository.
*   **Scaling:** Render allows you to scale your services up or down based on demand.
*   **Continuous Deployment:** Render can automatically redeploy your application whenever you push changes to your connected Git branch.
*   **Health Checks:** Configure health checks to ensure your services are running correctly.
*   **Logging:** Render provides centralized logging for all your services.

## 4. Supabase (Database Hosting)

You are now using Supabase, which provides a fully managed PostgreSQL database. This means:
*   You don't need to deploy PostgreSQL yourself.
*   Supabase handles backups, scaling, and maintenance.
*   Your application connects to it via the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (for backend operations).

This guide should help you understand the deployment landscape for your project.

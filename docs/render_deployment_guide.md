# Render Deployment Guide: Telegram Keyword Bot

This guide provides focused instructions for deploying the Telegram Keyword Bot project's backend and frontend components to Render, a cloud platform for hosting web services.

## 1. Project Overview (Render Context)

The project consists of:
*   **`frontend/`**: A Next.js application providing the web interface.
*   **`backend/`**: A Node.js/Express API server that handles logic and interacts with bot services.
*   **`docker-compose.yml` & `Dockerfile`s**: Configuration for containerizing the application, which Render can use.

The database (PostgreSQL on Supabase) and Redis are external services that Render will connect to.

## 2. Prerequisites

Before you begin, ensure you have:
*   A Render account ([render.com](https://render.com)).
*   Your project code pushed to a Git repository (GitHub, GitLab, Bitbucket).
*   A Supabase project with your database schema migrated and credentials ready.

## 3. Environment Variables

All sensitive information and configuration values should be set as environment variables directly in Render's dashboard for each service, not hardcoded in your repository. You will need the following:

*   **Supabase:**
    *   `SUPABASE_URL`
    *   `SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
*   **Redis:**
    *   `REDIS_URL` (if using a managed Redis instance on Render or another provider)
*   **Telegram:**
    *   `TELEGRAM_BOT_TOKEN`
*   **Eitaa (if using unofficial API):**
    *   `EITAA_PHONE`
    *   `EITAA_PASSWORD`
*   **OpenAI:**
    *   `OPENAI_API_KEY`
*   **Server (Backend):**
    *   `PORT` (Render typically sets this, often to `10000`)
    *   `NODE_ENV` (e.g., `production`)
*   **Rate Limiting:**
    *   `RATE_LIMIT_WINDOW_MS`
    *   `RATE_LIMIT_MAX_REQUESTS`

## 4. Render Services Configuration

You will typically deploy your project to Render using the following services:

### 4.1. Backend Web Service

1.  **Create a new Web Service** in Render.
2.  **Connect your Git repository.**
3.  **Configuration:**
    *   **Name:** `backend-service` (or similar)
    *   **Region:** Choose a region close to your users and Supabase instance.
    *   **Branch:** `main` (or your deployment branch)
    *   **Root Directory:** `backend/`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js` (or `npm start` if defined in `package.json`)
    *   **Environment Variables:** Add all relevant variables from Section 3.
    *   **Health Check Path:** `/api/monitoring/status` (or a simple `/` if you add a basic health endpoint)

### 4.2. Frontend Web Service

1.  **Create a new Web Service** in Render.
2.  **Connect your Git repository.**
3.  **Configuration:**
    *   **Name:** `frontend-service` (or similar)
    *   **Region:** Same as backend.
    *   **Branch:** `main` (or your deployment branch)
    *   **Root Directory:** `frontend/`
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
    *   **Environment Variables:**
        *   `NODE_ENV`: `production`
        *   `NEXT_PUBLIC_API_URL`: The public URL of your deployed Backend Web Service (e.g., `https://backend-service.onrender.com/api`).

### 4.3. Redis (Optional)

If you need a managed Redis instance for rate limiting or other features:
1.  **Create a new Redis instance** in Render.
2.  **Connect your Redis instance** to your backend service by setting the `REDIS_URL` environment variable in the backend service to the internal connection string provided by Render for your Redis instance.

## 5. Deployment Steps (High-Level)

1.  **Connect to Git:** In your Render dashboard, create new services and link them to your GitHub/GitLab repository.
2.  **Configure Services:** For each component (backend, frontend), set up the build and start commands, and crucially, add all required environment variables.
3.  **Build and Deploy:** Render will automatically build and deploy your application. Monitor the deploy logs for any errors.

## 6. Key Considerations for Cloud Deployment

*   **Environment Variables:** Always use Render's environment variable management for sensitive data.
*   **Scaling:** Render allows you to scale your services up or down based on demand.
*   **Continuous Deployment:** Render can automatically redeploy your application whenever you push changes to your connected Git branch.
*   **Health Checks:** Configure health checks to ensure your services are running correctly.
*   **Logging:** Render provides centralized logging for all your services, which is invaluable for debugging.
*   **Supabase Integration:** Your Supabase database is hosted externally. Ensure network access rules (if any) allow connections from Render's IP ranges.

This focused guide should help you successfully deploy your Telegram Keyword Bot to Render.
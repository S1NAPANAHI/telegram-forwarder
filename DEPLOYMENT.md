# Deployment and Testing Guide

This guide provides step-by-step instructions for deploying the Telegram Forwarder Bot to the [Render](https://render.com/) cloud platform.

## 1. Prerequisites

- A [Render](https://render.com/) account.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and a database cluster.
- A [GitHub](https://github.com/) or [GitLab](https://gitlab.com/) account with this project's code pushed to a repository.
- A Telegram Bot Token from BotFather.
- An OpenAI API Key (optional, for AI features).

## 2. Initial Setup on Render

You will create three services on Render:

1.  **MongoDB Atlas**: This is an external database. Ensure your cluster is created and you have the connection string (URI). Make sure to whitelist all IP addresses (`0.0.0.0/0`) in the Atlas network settings so Render can connect.
2.  **Redis Instance**: On the Render dashboard, create a new **Redis** instance. Once it is live, copy its **Internal Connection URL**.
3.  **Git Repository**: Connect your GitHub/GitLab repository to your Render account.

## 3. Backend Deployment

Create a new **Web Service** on Render for the backend.

- **Repository**: Select your project's repository.
- **Environment**: Choose **Docker**.
- **Dockerfile Path**: Point to `./Dockerfile.backend`.
- **Start Command**: `node server.js`

In the **Environment** tab, add the following environment variables:

| Key                  | Value                                                              | Notes                            |
| -------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `NODE_ENV`           | `production`                                                       |                                  |
| `MONGODB_URI`        | Your MongoDB Atlas connection string.                              | **Secret**                       |
| `REDIS_URL`          | The Internal Connection URL from your Render Redis instance.       | **Secret**                       |
| `TELEGRAM_BOT_TOKEN` | Your token from BotFather.                                         | **Secret**                       |
| `OPENAI_API_KEY`     | Your OpenAI API key.                                               | **Secret**                       |
| `JWT_SECRET`         | A long, random, and secret string for signing tokens.              | **Secret**                       |
| `EITAA_PHONE`        | Your Eitaa phone number (optional).                                | **Secret**                       |
| `EITAA_PASSWORD`     | Your Eitaa password (optional).                                    | **Secret**                       |

After setting the environment variables, click **Create Web Service**. Render will build and deploy your backend.

## 4. Frontend Deployment

Create a second **Web Service** on Render for the frontend.

- **Repository**: Select the same repository.
- **Environment**: Choose **Node**. Render should detect it as a Next.js app.
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

In the **Environment** tab, add the following environment variable:

| Key                   | Value                                                     | Notes                               |
| --------------------- | --------------------------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL` | The public URL of your deployed backend service on Render. | e.g., `https://your-backend.onrender.com` |

After setting the environment variable, click **Create Web Service**.

## 5. Manual Testing Checklist

Once both services are deployed and running, perform the following checks to ensure everything is working correctly:

- [ ] **Access the Frontend**: Open the public URL of your frontend service.
- [ ] **User Registration**: Can you create a new user account?
- [ ] **User Login**: Can you log in with the newly created account?
- [ ] **Dashboard**: Does the dashboard load correctly?
- [ ] **Keyword Management**: Can you add and delete keywords?
- [ ] **Channel Management**: Can you add a new channel to monitor?
- [ ] **Destination Management**: Can you add a destination to forward messages to?
- [ ] **Monitoring**: Start monitoring a channel. Does the status update correctly?
- [ ] **Forwarding**: Post a message in the monitored channel that contains one of your keywords. Is the message forwarded to your destination?
- [ ] **Logs**: Does the forwarded message appear in the logs page and the recent activity feed on the dashboard?

## 6. Eitaa Login

If you are monitoring an Eitaa channel, the first time the bot runs it will require a manual login. You will need to check the backend logs on Render for a message prompting you to enter a verification code. The process is detailed in `docs/Eitaa_Login_Guide.md`, but it may be difficult to perform on a headless cloud service like Render.

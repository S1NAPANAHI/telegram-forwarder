# Deployment and Testing Guide

This guide provides step-by-step instructions for deploying and testing the Telegram Keyword Bot application.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker:** [Get Docker](https://docs.docker.com/get-docker/)
- **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/)

## 2. Configuration

The application uses a `.env` file for configuration. This file contains sensitive information and should **never** be committed to version control.

1.  **Create the `.env` file:** In the root directory of the project, create a file named `.env`.

2.  **Add the following variables:** Copy the contents of `.env.example` (if it exists) or use the following template and fill in your actual credentials:

    ```
    # Database
    MONGODB_URI=mongodb://mongodb:27017/newsmonitor
    REDIS_URL=redis://redis:6379

    # Telegram
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

    # Eitaa (if using unofficial API)
    EITAA_PHONE=your_phone_number
    EITAA_PASSWORD=your_password

    # OpenAI
    OPENAI_API_KEY=your_openai_api_key

    # JWT
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=7d

    # Server
    PORT=5000
    NODE_ENV=production

    # Rate Limiting
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100
    ```

## 3. Deployment

The application is deployed using Docker Compose, which orchestrates the frontend, backend, database, and other services.

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

# Phase 1: Core Infrastructure (Weeks 1-2)

## Step 1.1: Project Setup & Architecture
- [x] Initialize project directory (Backend and Frontend npm projects initialized)
- [ ] Setup Frontend (Next.js, TypeScript, Tailwind, ESLint)
  - [ ] Create Next.js app (Only npm init -y was performed, full create-next-app not yet)
  - [x] Install axios, @tanstack/react-query, @headlessui/react, @heroicons/react (Note: @tanstack/react-query installed instead of react-query for React 19 compatibility)
  - [x] Install tailwindcss, autoprefixer, postcss
- [x] Setup Backend (Node.js, Express)
  - [x] Create backend directory
  - [x] Initialize npm project
  - [x] Install express, cors, helmet, morgan, dotenv
  - [x] Install mongoose, jsonwebtoken, bcryptjs
  - [x] Install node-cron, telegram-bot-api
  - [x] Install puppeteer, cheerio
  - [x] Install express-rate-limit
  - [x] Install axios, natural, persian-preprocess, winston (Additional backend dependencies)
  - [x] Install nodemon (Backend development dependency)

## Step 1.2: Database Design
- [x] Define User Schema (MongoDB)
- [x] Define Keywords Schema (MongoDB)
- [x] Define Channel Schema (MongoDB)
- [x] Define Destination Schema (MongoDB)
- [x] Define Log Schema (MongoDB)

## Step 1.3: Backend API Development
- [x] Setup Express Server Structure (server.js)
  - [x] Initialize Express app
  - [x] Configure middleware (express.json, cors, helmet, morgan, rate limiting)
  - [x] Define API routes (auth, keywords, channels, destinations, monitoring, logs)
  - [x] Connect to MongoDB
  - [x] Start server
- [x] Implement Keywords API Routes (routes/keywords.js)
  - [x] POST /api/keywords (Add keyword with limit check)
  - [x] GET /api/keywords (Get all keywords for user)
  - [x] DELETE /api/keywords/:id (Delete keyword)
- [x] Implement Auth API Routes (routes/auth.js)
  - [x] POST /api/auth/register (Register user)
  - [x] POST /api/auth/login (Authenticate user & get token)
  - [x] GET /api/auth (Get user by token)
- [x] Implement Channels API Routes (routes/channels.js)
  - [x] POST /api/channels (Add a new channel)
  - [x] GET /api/channels (Get all channels for user)
  - [x] DELETE /api/channels/:id (Delete a channel)
- [x] Implement Destinations API Routes (routes/destinations.js)
  - [x] POST /api/destinations (Add a new destination)
  - [x] GET /api/destinations (Get all destinations for user)
  - [x] DELETE /api/destinations/:id (Delete a destination)
- [x] Implement Monitoring API Routes (routes/monitoring.js)
  - [x] POST /api/monitoring/start/:channelId (Start monitoring a specific channel)
  - [x] POST /api/monitoring/stop/:channelId (Stop monitoring a specific channel)
  - [x] GET /api/monitoring/status (Get status of all monitored channels for the user)
- [x] Implement Logs API Routes (routes/logs.js)
  - [x] GET /api/logs (Get all logs for the authenticated user)
  - [x] GET /api/logs/:id (Get a single log entry by ID)

## Step 1.4: Frontend Development
- [x] Setup Next.js App Structure (pages/dashboard.tsx)
  - [x] Create Dashboard component
  - [x] Implement state for new keyword
  - [x] Fetch keywords using react-query
  - [x] Implement add keyword mutation
  - [x] Handle add keyword form submission
  - [x] Display loading state
  - [x] Render keywords list
  - [x] Implement delete keyword functionality (mutation not shown in plan, but implied)
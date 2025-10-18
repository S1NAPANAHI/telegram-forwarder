# Telegram Forwarder Bot

🤖 **Universal Telegram Message Forwarder** with Admin/Non-Admin Mode Support, Web Dashboard, and Multi-Platform Integration.

## 🌟 Features

### **Universal Monitoring Modes**
- **🔑 Admin Mode (Bot API)**: Full access when bot is admin in channels/groups
- **👤 Non-Admin Mode (Client API)**: Monitor any channels you can access as a user
- **🔄 Hybrid Mode**: Automatically switches between modes based on permissions
- **📡 Pull-Based Monitoring**: Periodic polling for channels without real-time access

### **Smart Discovery System**
- **🔍 Auto-Discovery**: Automatically detect all chats where bot is member, including admin status and numeric ID extraction.
- **⚡ Admin Detection**: Real-time admin status checking and updates.
- **📊 Web Dashboard**: Manage discovered chats through intuitive web interface.
- **🚀 Bulk Operations**: Promote multiple chats to monitoring simultaneously.

### **Advanced Filtering & Forwarding**
- **🎯 Keyword Matching**: Exact, contains, and regex pattern matching.
- **🔤 Case Sensitivity**: Optional case-sensitive matching.
- **📈 Analytics**: Comprehensive message forwarding statistics.
- **🎛️ Multiple Destinations**: Forward to multiple channels/chats with flexible input (e.g., @username, t.me/link, numeric ID).

### **Multi-Platform Support**
- **💬 Telegram**: Full Bot API and Client API support.
- **🇮🇷 Eitaa**: Iranian messenger integration.
- **🌐 Websites**: RSS feeds and web scraping.
- **🔗 Extensible**: Easy to add new platforms.

### **Web Dashboard**
- **📱 Responsive Design**: Works on desktop and mobile.
- **🌍 Multi-Language**: English and Persian (Farsi) support.
- **🛡️ Authentication**: Secure JWT-based authentication.
- **⚙️ Configuration**: Complete bot configuration through web interface, including managing discovered chats and forwarding destinations.

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- Supabase account (PostgreSQL database)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- Optional: Telegram API credentials for Client API mode

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/S1NAPANAHI/telegram-forwarder.git
   cd telegram-forwarder
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit with your configuration
   nano backend/.env
   ```

4. **Database Setup**
   ```sql
   -- Run the migration in your Supabase SQL editor
   -- File: backend/database/migrations/add_discovered_chats_table.sql
   -- Also ensure to run the SQL for the 'discovered_chats' table provided in the documentation.
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

### **Environment Variables**

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Bot API (Required)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=your_webhook_url

# Client API (Optional - for non-admin mode)
TG_API_ID=your_api_id
TG_API_HASH=your_api_hash
TG_PHONE=your_phone_number
TG_2FA_PASSWORD=your_2fa_password
TG_SESSION=generated_session_string

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Security
JWT_SECRET=your_jwt_secret
```

### **Bot Setup**

1. **Create bot** with [@BotFather](https://t.me/BotFather)
2. **Disable privacy mode** with `/setprivacy` → Disable
3. **Set webhook** (automatically done by the application)
4. **Add bot to channels** where you want admin access

### **Client API Setup** (Optional)

1. **Get API credentials** from [my.telegram.org](https://my.telegram.org)
2. **Add to environment variables**
3. **First login** will generate session string automatically
4. **Store session string** securely in environment variables

## 📖 Usage

### **Telegram Commands**

- `/start` - Initialize bot and show welcome message
- `/discover` - **🔍 Scan all chats, detect admin status, and extract numeric IDs.**
- `/add_destination <@username|link|ID>` - **➕ Add a new forwarding destination with automatic ID resolution.**
- `/destinations` - **📋 List all configured forwarding destinations.**
- `/status` - Show bot status and monitored channels
- `/webapp` - Open web management panel
- `/menu` - Show quick action buttons
- `/help` - Display help information
- `/language` - Change language (English/Persian)

### **Discovery Workflow**

1. **Run Discovery**: Use `/discover` command or web dashboard scan
2. **Review Results**: Check discovered chats in web dashboard
3. **Promote Chats**: Select chats to promote to active monitoring
4. **Configure Keywords**: Set up keyword filters for each channel
5. **Set Destinations**: Configure where messages should be forwarded

### **Web Dashboard Features**

- **📊 Discovery Dashboard**: View all discovered chats with admin status
- **⚙️ Channel Management**: Configure monitoring for each channel
- **🎯 Keyword Setup**: Create and manage keyword filters
- **📍 Destination Config**: Set up forwarding destinations
- **📈 Analytics**: View forwarding statistics and logs
- **👤 User Settings**: Manage account and preferences

## 🏗️ Architecture

### **Backend Structure**
```
backend/
├── bots/                   # Bot implementations
│   ├── telegramBot.js     # Enhanced Telegram bot with discovery
│   ├── clientMonitor.js   # Telegram Client API monitor
│   └── eitaaBot.js        # Eitaa messenger integration
├── services/              # Business logic services
│   ├── TelegramDiscoveryService.js  # Chat discovery engine
│   ├── PullMonitoringService.js     # Pull-based monitoring
│   ├── monitoringManager.js         # Universal monitoring manager
│   ├── IDResolutionService.js       # Service for resolving chat identifiers to numeric IDs
│   └── ...                # Other services
├── routes/                # API endpoints
│   ├── discovery.js       # Discovery management API
│   └── ...               # Other API routes
└── database/              # Database schema and migrations
```

### **Frontend Structure**
```
frontend/
├── src/
│   ├── components/
│   │   ├── DiscoveryDashboard.jsx  # Discovery management UI
│   │   └── ...                     # Other components
│   ├── pages/             # Page components
│   └── hooks/             # Custom React hooks
```

### **Database Schema**

- **`users`** - User accounts and preferences
- **`channels`** - Monitored channels configuration
- **`discovered_chats`** - 🆕 **Auto-discovered chats with admin status**
- **`keywords`** - Keyword filters for message matching
- **`destinations`** - Forwarding destination configurations
- **`message_logs`** - Message forwarding history and analytics

## 🔧 API Endpoints

### **Discovery API**

- `GET /api/discovery` - Get discovered chats with filtering
- `POST /api/discovery/scan` - **🔍 Trigger comprehensive chat discovery**
- `GET /api/discovery/status` - Get discovery statistics
- `POST /api/discovery/refresh` - Refresh admin statuses
- `POST /api/discovery/{chatId}/promote` - Promote chat to monitoring
- `POST /api/discovery/bulk-promote` - **🚀 Bulk promote multiple chats**

### **Monitoring API**

- `GET /api/channels` - Get monitored channels
- `POST /api/channels` - Add new monitored channel
- `PUT /api/channels/{id}` - Update channel configuration
- `DELETE /api/channels/{id}` - Remove channel monitoring

## 🚢 Deployment

### **Render.com (Recommended)**

1. **Fork this repository**
2. **Connect to Render.com**
3. **Create Web Service** pointing to your fork
4. **Set environment variables** in Render dashboard
5. **Deploy** - automatic from main branch

### **Docker**

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### **Manual Deployment**

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## 🔒 Security

- **🛡️ JWT Authentication**: Secure token-based authentication
- **🔐 Environment Variables**: Sensitive data stored securely
- **🚫 Input Validation**: Comprehensive input sanitization
- **📝 Audit Logging**: Complete activity logging
- **🌐 CORS Protection**: Cross-origin request protection

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **📚 Documentation**: Check the `/docs` folder for detailed guides
- **🐛 Issues**: Report bugs via GitHub Issues
- **💬 Discussions**: Use GitHub Discussions for questions
- **📧 Contact**: [Your contact information]

## 🎯 Roadmap

- [ ] **Real-time notifications** for discovered chats
- [ ] **Advanced analytics** dashboard
- [ ] **Machine learning** for smart keyword suggestions
- [ ] **Mobile app** for iOS and Android
- [ ] **Plugin system** for custom integrations
- [ ] **Advanced scheduling** for timed forwarding

---

**Made with ❤️ by [Your Name]**

*⭐ Don't forget to star this repository if you found it useful!*
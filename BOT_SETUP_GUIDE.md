# Bot Testing & Client API Setup Guide

## 🤖 Testing Bot Admin Functionality

### Critical Steps for Bot to Work in Your Admin Channels/Groups:

#### 1. Disable Privacy Mode in BotFather
**This is ESSENTIAL for group message monitoring:**

1. Open Telegram and find `@BotFather`
2. Send `/setprivacy`
3. Select your bot
4. Choose `Disable`
5. Confirm the change

**Why this matters:** With privacy mode enabled, bots only see messages that:
- Start with `/` (commands)
- Mention the bot `@botname`
- Are sent in private chats

With privacy disabled, the bot can see ALL messages in groups where it's admin.

#### 2. Add Bot as Admin with Correct Permissions

**For Channels:**
1. Go to your channel
2. Channel Info → Administrators → Add Administrator
3. Search for your bot username
4. Enable permissions:
   - ✅ **Delete Messages** (allows message access)
   - ✅ **Post Messages** (for forwarding responses)
   - ✅ **Edit Messages of Others** (recommended)

**For Groups/Supergroups:**
1. Group Info → Administrators → Add Administrator
2. Enable permissions:
   - ✅ **Delete Messages**
   - ✅ **Ban Users** (optional)
   - ✅ **Add New Members** (optional)

#### 3. Test the Flow

**Setup in Your Web Panel:**
1. Add a channel using any of these formats:
   - `@yourchannel`
   - `https://t.me/yourchannel`
   - `-1001234567890` (numeric channel ID)

2. Add keywords (e.g., `خیابان انقلاب`, `محله منیریه`)

3. Add a destination where the bot should forward (your private chat with the bot, or another channel where bot is admin)

**Test:**
1. Post a message in your admin channel containing the keyword
2. Bot should automatically copy/forward the message to your destination
3. Check backend logs for processing confirmation

### Common Issues & Solutions:

❌ **"Bot doesn't see group messages"**
→ Privacy mode is still enabled in BotFather

❌ **"Bot sees messages but doesn't forward"**
→ Check keyword matching (case sensitivity, exact vs contains)
→ Verify destination chat_id is correct and bot can post there

❌ **"403 Forbidden when forwarding"**
→ Bot lacks permissions in destination chat
→ Destination chat doesn't exist or bot was removed

## 📱 Telegram Client API Setup (for Non-Admin Monitoring)

To monitor channels where your bot is **NOT admin**, you need the Client API:

### Step 1: Get API Credentials

1. Go to **[my.telegram.org](https://my.telegram.org)**
2. Login with your phone number
3. Go to "API Development Tools"
4. Create a new application:
   - **App title:** Telegram Forwarder
   - **Short name:** tg-forwarder
   - **Platform:** Other
   - **Description:** Message forwarding service
5. Save these credentials:
   - **API ID** (number)
   - **API Hash** (string)

### Step 2: Configure Environment Variables

Add these to your Render backend service environment:

```env
TG_API_ID=12345678
TG_API_HASH=abcdef1234567890abcdef1234567890
TG_PHONE=+1234567890
TG_SESSION=
TG_2FA_PASSWORD=your_2fa_password_if_enabled
```

### Step 3: First Run Authentication

The first time the client runs, it will:
1. Send SMS code to your phone
2. Ask you to enter the code
3. Generate a session string
4. Save the session for future use

**Important:** Store the session string securely - it allows full access to your Telegram account.

### Step 4: Usage

Once configured, the client monitor will:
- ✅ Read messages from **any public channel** (no admin needed)
- ✅ Process keywords using your existing rules
- ✅ Forward matches using your bot to destinations
- ✅ Log all activity in your analytics

## 🚀 Deployment Steps

### Current Status:
✅ Code fixes pushed to GitHub  
✅ Bot admin handlers updated  
✅ Channels route fixed  
✅ Client monitor scaffolded  
✅ Dependencies added  

### Next Steps:

1. **Redeploy Backend on Render**
   - Go to Render Dashboard → Backend Service
   - Click "Deploy latest commit"
   - Wait for completion

2. **Test Bot Admin Functionality**
   - Disable privacy mode in BotFather
   - Add bot as admin to your test channel/group
   - Add channel in web panel
   - Add keywords and destination
   - Test message forwarding

3. **Optional: Setup Client API**
   - Get credentials from my.telegram.org
   - Add environment variables in Render
   - Redeploy to activate client monitoring

## 📊 Expected Results

After deployment:
- ✅ **Channels page works** (no more 400 errors)
- ✅ **Bot forwards messages** when admin in channels
- ✅ **Analytics shows forwarding activity**
- ✅ **Client monitoring available** (when configured)
- ✅ **Support for @username, URLs, and numeric IDs**

## 🔧 Troubleshooting

**400 errors on channel creation:**
- Check that you're providing either `channel_url` or `channel_id`
- Verify the format: `@channel`, `https://t.me/channel`, or `-1001234567890`

**Bot not forwarding despite being admin:**
- Check BotFather privacy settings
- Verify bot permissions in the channel
- Check keyword matching (logs will show processing attempts)
- Ensure destination is valid and bot can post there

**Client API setup issues:**
- Verify API ID/Hash from my.telegram.org
- Ensure phone number includes country code
- Check 2FA password if enabled
- Session string must be kept secure and persistent

Your bot should now work properly for admin channels, and you'll have the foundation for client-based monitoring of non-admin sources! 🎉
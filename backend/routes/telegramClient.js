const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const TelegramClientService = require('../services/TelegramClientService');

const telegramClientService = new TelegramClientService();

// POST /api/telegram-client/credentials
router.post('/credentials', authMiddleware, async (req, res) => {
  const { apiId, apiHash, phone } = req.body;
  const userId = req.user.id;

  if (!apiId || !apiHash || !phone) {
    return res.status(400).json({ error: 'apiId, apiHash, and phone are required' });
  }

  const { success, error, data } = await telegramClientService.saveCredentials({ userId, apiId, apiHash, phone });

  if (!success) {
    return res.status(500).json({ error });
  }

  res.json(data);
});

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

// POST /api/telegram-client/login
router.post('/login', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const credentials = await telegramClientService.getCredentials(userId);

  if (!credentials) {
    return res.status(404).json({ error: 'Telegram client credentials not found.' });
  }

  const { api_id, api_hash, phone, session } = credentials;
  const stringSession = new StringSession(session || '');
  const client = new TelegramClient(stringSession, parseInt(api_id), api_hash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();

    const { phoneCodeHash } = await client.sendCode(
      {
        apiId: parseInt(api_id),
        apiHash: api_hash,
      },
      phone
    );

    await telegramClientService.updatePhoneCodeHash({ userId, phoneCodeHash });

    res.json({ success: true, message: 'Phone code sent.' });
  } catch (error) {
    console.error('Telegram login error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.disconnect();
  }
});

// POST /api/telegram-client/submit-code
router.post('/submit-code', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Phone code is required' });
  }

  const credentials = await telegramClientService.getCredentials(userId);

  if (!credentials || !credentials.phone_code_hash) {
    return res.status(400).json({ error: 'Login process not initiated or phone code hash not found.' });
  }

  const { api_id, api_hash, phone, session, phone_code_hash } = credentials;
  const stringSession = new StringSession(session || '');
  const client = new TelegramClient(stringSession, parseInt(api_id), api_hash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();

    await client.signIn(phone, {
      phoneCode: code,
      phoneCodeHash: phone_code_hash,
    });

    const newSession = client.session.save();
    await telegramClientService.updateSession({ userId, session: newSession });
    await telegramClientService.updateStatus({ userId, status: 'connected' });

    res.json({ success: true, message: 'Login successful.' });
  } catch (error) {
    console.error('Telegram sign in error:', error);
    await telegramClientService.updateStatus({ userId, status: 'error', error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    await client.disconnect();
  }
});

// POST /api/telegram-client/disconnect
router.post('/disconnect', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const credentials = await telegramClientService.getCredentials(userId);

  if (!credentials) {
    return res.status(404).json({ error: 'Telegram client credentials not found.' });
  }

  const { api_id, api_hash, session } = credentials;
  const stringSession = new StringSession(session || '');
  const client = new TelegramClient(stringSession, parseInt(api_id), api_hash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();
    await client.logOut();

    await telegramClientService.updateSession({ userId, session: '' });
    await telegramClientService.updateStatus({ userId, status: 'disconnected' });

    res.json({ success: true, message: 'Disconnected successfully.' });
  } catch (error) {
    console.error('Telegram disconnect error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.disconnect();
  }
});

// GET /api/telegram-client/status
router.get('/status', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const credentials = await telegramClientService.getCredentials(userId);

  if (!credentials) {
    return res.json({ status: 'not_configured' });
  }

  res.json({
    status: credentials.status,
    apiId: credentials.api_id,
    phone: credentials.phone,
    isActive: credentials.is_active,
    lastError: credentials.last_error,
  });
});

module.exports = router;

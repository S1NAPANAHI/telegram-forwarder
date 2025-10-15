const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

let clientState = {
  configured: false,
  status: 'not_configured', // not_configured | awaiting_code | awaiting_2fa | logged_in | error
  phone: null,
  lastError: null,
  maskedSession: null
};

// Rate limit auth endpoints
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
router.use(limiter);

// Helper to mask values
function mask(val) {
  if (!val) return null;
  const s = String(val);
  if (s.length <= 6) return '***';
  return s.slice(0, 3) + '***' + s.slice(-3);
}

// GET /api/client-auth/status
router.get('/status', (req, res) => {
  const hasCreds = !!(process.env.TG_API_ID && process.env.TG_API_HASH);
  const hasSession = !!process.env.TG_SESSION;
  clientState.configured = hasCreds;
  if (!hasCreds) clientState.status = 'not_configured';
  return res.json({
    configured: hasCreds,
    status: clientState.status,
    phone: mask(clientState.phone || process.env.TG_PHONE || null),
    lastError: clientState.lastError,
    hasSession,
    maskedSession: clientState.maskedSession || (hasSession ? mask(process.env.TG_SESSION) : null)
  });
});

// POST /api/client-auth/init
router.post('/init', async (req, res) => {
  try {
    if (!process.env.TG_API_ID || !process.env.TG_API_HASH) {
      clientState.status = 'not_configured';
      return res.status(400).json({ error: 'Client API credentials not configured' });
    }

    clientState.phone = req.body?.phone || process.env.TG_PHONE || null;
    if (!clientState.phone) {
      return res.status(400).json({ error: 'Phone number is required (TG_PHONE or payload.phone)' });
    }

    // Placeholder: in real flow we would start gramJS client here and send code
    clientState.status = 'awaiting_code';
    return res.json({ ok: true, status: clientState.status });
  } catch (e) {
    clientState.status = 'error';
    clientState.lastError = e.message;
    return res.status(500).json({ error: 'Failed to init client auth' });
  }
});

// POST /api/client-auth/code
router.post('/code', async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Code is required' });

    if (process.env.TG_2FA_PASSWORD) {
      clientState.status = 'awaiting_2fa';
      return res.json({ ok: true, status: clientState.status });
    }

    // Simulate session creation
    const session = 'SESSION_' + Date.now().toString(36) + '_PLACEHOLDER';
    clientState.maskedSession = mask(session);
    clientState.status = 'logged_in';
    return res.json({ ok: true, status: clientState.status, session_hint: clientState.maskedSession });
  } catch (e) {
    clientState.status = 'error';
    clientState.lastError = e.message;
    return res.status(500).json({ error: 'Failed to accept code' });
  }
});

// POST /api/client-auth/2fa
router.post('/2fa', async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const session = 'SESSION_' + Date.now().toString(36) + '_PLACEHOLDER';
    clientState.maskedSession = mask(session);
    clientState.status = 'logged_in';
    return res.json({ ok: true, status: clientState.status, session_hint: clientState.maskedSession });
  } catch (e) {
    clientState.status = 'error';
    clientState.lastError = e.message;
    return res.status(500).json({ error: 'Failed to accept 2FA' });
  }
});

module.exports = router;

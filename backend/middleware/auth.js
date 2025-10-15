const { verifyAccessToken } = require('../services/tokenService');
const supabase = require('../database/supabase');
const AutoPromoteService = require('../services/AutoPromoteService');

/**
 * JWT Authentication Middleware using tokenService
 * (truncated for brevity)
 */
const jwtAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
    else if (req.cookies && req.cookies.access_token) token = req.cookies.access_token;

    if (!token) return res.status(401).json({ error: 'Access denied. Authentication token required.', requiresAuth: true });

    try {
      const decoded = verifyAccessToken(token);
      let { data: userData } = await supabase.from('users').select('*').eq('id', decoded.userId).maybeSingle();

      if (!userData) {
        const { data: authData } = await supabase.auth.admin.getUserById(decoded.userId);
        if (authData?.user) {
          const { data: upserted } = await supabase.from('users').upsert({
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.user_metadata?.username || null,
            is_active: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          }, { onConflict: 'id' }).select('*').single();
          userData = upserted || { id: authData.user.id, email: authData.user.email };
        }
      }

      if (!userData) return res.status(401).json({ error: 'User account not found or deactivated.', requiresAuth: true });
      if (userData.is_active === false) return res.status(401).json({ error: 'User account is deactivated.', requiresAuth: true });

      // Attach user
      req.user = { id: userData.id, email: userData.email, username: userData.username || null };
      req.jwt = decoded;

      // NEW: Auto-promote discovered admin chats for this user (Telegram only)
      // Triggered opportunistically on first authenticated request after login/refresh
      try {
        const promoted = await AutoPromoteService.promoteAllAdminForUser(req.user.id);
        if (promoted.length) {
          console.log(`Auto-promoted ${promoted.length} admin chats for user ${req.user.id}`);
        }
      } catch (autoErr) {
        console.warn('Auto-promote skipped:', autoErr.message);
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Authentication token has expired.', requiresAuth: true, code: 'TOKEN_EXPIRED' });
      if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid authentication token.', requiresAuth: true, code: 'INVALID_TOKEN' });
      throw error;
    }
  } catch (error) {
    console.error('[jwtAuth] Authentication error:', error);
    return res.status(500).json({ error: 'Authentication service error' });
  }
};

module.exports = jwtAuth;
module.exports.jwtAuth = jwtAuth;

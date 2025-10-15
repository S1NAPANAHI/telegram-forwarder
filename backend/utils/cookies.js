const cookieOptionsBase = {
  httpOnly: true,
  secure: true, // ensure HTTPS in production
  sameSite: 'lax',
  path: '/',
};

function refreshCookieOptions(days){
  const maxAge = days * 24 * 60 * 60 * 1000;
  return { ...cookieOptionsBase, maxAge };
}

function clearCookieOptions(){
  return { ...cookieOptionsBase, maxAge: 0 };
}

module.exports = { refreshCookieOptions, clearCookieOptions };

const cookieOptionsBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only secure in production (HTTPS)
  sameSite: 'none', // Required for cross-origin requests with credentials
  path: '/'
  // Remove domain setting - let browsers handle it naturally
  // domain: undefined // Don't set domain for cross-subdomain cookies on Render
};

function refreshCookieOptions(days){
  const maxAge = days * 24 * 60 * 60 * 1000;
  return { ...cookieOptionsBase, maxAge };
}

function clearCookieOptions(){
  return { ...cookieOptionsBase, maxAge: 0 };
}

module.exports = { refreshCookieOptions, clearCookieOptions };
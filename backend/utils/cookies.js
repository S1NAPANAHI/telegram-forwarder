const cookieOptionsBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only secure in production (HTTPS)
  sameSite: 'lax',
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined // allow subdomain sharing on render
};

function refreshCookieOptions(days){
  const maxAge = days * 24 * 60 * 60 * 1000;
  return { ...cookieOptionsBase, maxAge };
}

function clearCookieOptions(){
  return { ...cookieOptionsBase, maxAge: 0 };
}

module.exports = { refreshCookieOptions, clearCookieOptions };

const expireTime = 60 * 60 * 1000; // Expires after 1 hour (minutes * seconds * milliseconds)

function sessionValidation(req, res, next) {
  if (!req.session.authenticated) {
    req.session.authenticated = true;
    req.session.loggedIn = false;
    req.session.history = [];
    req.session.cookie.maxAge = expireTime;
  }
  next();
}

function isLoggedIn(req) {
  return req.session.loggedIn;
}

function loginValidation(req, res, next) {
  if (isLoggedIn(req)) {
    next();
  } else {
    res.redirect('/profile?redirectedPrompt=true');
  }
}

module.exports = { sessionValidation, isLoggedIn, loginValidation };

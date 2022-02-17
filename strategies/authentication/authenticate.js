const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("config");
const dev = process.env.NODE_ENV !== "production";

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  signed: true,
  maxAge: eval(config.get("REFRESH_TOKEN_EXPIRY")) * 1000,
  sameSite: "none"
}

exports.getToken = user => {
  return jwt.sign(user, config.get("JWT_SECRET"), {
    expiresIn: eval(config.get("SESSION_EXPIRY")),
  })
}

exports.getRefreshToken = user => {
  const refreshToken = jwt.sign(user, config.get("REFRESH_TOKEN_SECRET"), {
    expiresIn: eval(config.get("REFRESH_TOKEN_EXPIRY")),
  })
  return refreshToken
}

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
}
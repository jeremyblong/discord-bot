// check if user is authenticated before proceeding...

const loggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login');
    }
}
module.exports = loggedIn;
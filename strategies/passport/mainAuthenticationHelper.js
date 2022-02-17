const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const { Connection } = require("../mongoUtil.js");
const { decrypt } = require("../crypto.js");



passport.use("employers", new LocalStrategy((username, password, done) => {

    console.log("tick - ", username, password, done);

    const collection = Connection.db.db("db").collection("employers");

    const trimmed = username.toLowerCase().trim();

    collection.findOne({ $or: [{
        username: trimmed
    }, {
        email: trimmed
    }]}).then((user) => {
        console.log(user);

        if (!user) {
            console.log("RAN!");
            
            return done(null, false, { message: "'Error - a problem occurred...'" });
        } else {
            if (((trimmed === user.username) || (trimmed === user.email)) && (password === decrypt(user.password))) {
                return done(null, user);
            } else {
                return done(null, false, { message: "User could NOT be authenticated - make sure you're using a valid email and password combination." })
            }
        }
    }).catch((err) => {
        console.log(err);

        return done(err);
    })
}));

//called while after logging in / signing up to set user details in req.user
passport.serializeUser((user, done) => {
    done(null, user._id);
});
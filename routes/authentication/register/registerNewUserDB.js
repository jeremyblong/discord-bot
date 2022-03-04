const express = require("express");
const router = express.Router();
const User = require("../../../schemas/auth/register/registerNewUserSchema.js");
const { v4: uuidv4 } = require('uuid');
const { Connection } = require("../../../mongoUtil.js");

router.get("/", async (req, res) => {

    const { 
        user
    } = req.query;

    console.log("user data custom route --- : ", user);

    const collection = Connection.db.db("myFirstDatabase").collection("admins");

    const { id, username, descriminator, avatar, bot, banner, locale, verified, email, mfa_enabled, system, discriminator, defaultAvatarURL, avatarURL } = JSON.parse(user);

    const newUser = new User({
      id, 
      username, 
      descriminator, 
      avatar, 
      uniqueId: uuidv4(),
      bot, 
      banner, 
      locale, 
      verified, 
      system,
      defaultAvatarURL,
      avatarURL,
      discriminator,
      email,
      mfa_enabled,
      coins: 0,
      resting: false,
      frozen: false
    });
    
    const alreadySavedOrNot = await collection.findOne({ id: id });

    console.log("alreadySavedOrNot", alreadySavedOrNot);

    if (alreadySavedOrNot !== null) {
      res.json({
        message: "User already exists! Do nothing..."
      })
    } else {
      newUser.save((err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("result", result);
  
          res.json({
            message: "Successfully saved user data!",
            result
          })
        }
      });
    }
});

module.exports = router;
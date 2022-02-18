const express = require("express");
const router = express.Router();
const User = require("../../../schemas/auth/register/registerNewUserSchema.js");
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");
const { Connection } = require("../../../mongoUtil.js");
const fetch = require("node-fetch");

router.get("/", async (req, res) => {

    const { 
        token
    } = req.query;

    const userResult = await fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const collection = Connection.db.db("myFirstDatabase").collection("users");

    const result = await userResult.json();

    console.log("result FIRST...:", result);

    const { id, username, descriminator, avatar, bot, banner, locale, verified, email, mfa_enabled } = result;

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
      email,
      mfa_enabled
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
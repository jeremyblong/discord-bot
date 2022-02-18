const express = require('express');
const config = require("config");
const fetch = require('node-fetch');
const router = express.Router();
const axios = require("axios");
const { client } = require("../../../../utils/discordAPI.js");
const Discord = require("discord.js");
const { User, Guild } = require("discord.js");
const { Connection } = require("../../../../mongoUtil.js");


const guildInfo = {
    description: "Custom guild for testing purposes...",
    id: "943199288140369971"
}
// guild creation/selectionadd
const guild = new Guild(client, guildInfo);


router.post('/', async (req, res) => {

    const { token, channelID, username } = req.body;

    console.log(req.body);

    const collection = Connection.db.db("myFirstDatabase").collection("users");

    
    const savedUser = await collection.findOne({ username: username.toLowerCase() }).then(user => user);

    console.log("savedUser", savedUser);

    if (savedUser !== null) {

        console.log("savedUser", savedUser);

        const useroptions = {
            avatar: savedUser.avatar,
            bot: false,
            id: savedUser.id,
            username: savedUser.username,
            locale: savedUser.locale
        };

        const newUserAddition = new User(client, useroptions);

        const options = {
            accessToken: token
        };

        const newMember = await guild.members.add(newUserAddition, options);

        console.log("newMember", newMember);

        res.json({
            message: "Successfully added new user to group!"
        })
    } else {
        console.log("NO MATCH!");
    }
});

module.exports = router;
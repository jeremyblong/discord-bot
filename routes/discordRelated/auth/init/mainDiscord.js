const express = require('express');
const config = require("config");
const router = express.Router();

const CLIENT_ID = config.get("discordClientID");
const CLIENT_SECRET = config.get("discordClientSecret");


const redirect = 'http://localhost:50451/api/discord/callback';

router.get('/', (req, res) => {
    console.log("ran!");

    res.status(200).redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&redirect_uri=${redirect}&response_type=code&scope=bot%20guilds%20guilds.join%20guilds.members.read%20applications.commands%20messages.read%20gdm.join`);
});

module.exports = router;
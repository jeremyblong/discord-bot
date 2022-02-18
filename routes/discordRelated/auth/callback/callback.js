const express = require('express');
const config = require("config");
const fetch = require('node-fetch');
const router = express.Router();
const { catchAsync } = require("../../../../utils/general.js");
const { URLSearchParams } = require('url');


const redirect = 'http://localhost:50451/api/discord/callback';


router.get('/', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;

    console.log("code", code);


    // Add the parameters
    const params = new URLSearchParams();
    params.append('client_id', config.get("discordClientID"));
    params.append('client_secret', config.get("discordClientSecret"));
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect);
    params.append("scope", 'identify')

    const response = await fetch(`https://discordapp.com/api/oauth2/token`,
      {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: params
      });
    const json = await response.json();
    
    console.log("JSON", json);

    const encodedToken = encodeURIComponent(json.access_token);

    await res.redirect(`http://localhost:8080/callback/discord/${encodedToken}`);
}));


module.exports = router;
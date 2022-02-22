const { Client } = require("discord.js");
const { botIntents } = require("../config/config.js");

const client = new Client({
    intents: botIntents,
    partials: ['CHANNEL', 'MESSAGE'],
});

module.exports = {
    client
}
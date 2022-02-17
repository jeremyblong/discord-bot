const config = require("config");


const startBot = (client) => {
    client.login(config.get("discordToken"));
};

module.exports = {
    startBot
};
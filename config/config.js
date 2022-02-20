const { Intents } = require('discord.js');

const {
    DIRECT_MESSAGES,
    GUILD_MESSAGES,
    GUILDS
} = Intents.FLAGS;

const commands = {
    getName: "get-name",
    tellJoke: "tell-a-joke",
    sad: "sad",
    lastMsgs: "last-messages",
    scrub: "scrub",
    rest: "rest",
    invite: "invite",
    sleep: "sleep",
    steal: "steal",
    bones: "bones",
    poker: "poker",
    snipe: "snipe", // @player
    aim: "aim",
    duel: "duel",
    plank: "plank", // @player
    loot: "loot",
    // loot: "loot", // @player
    stealth: "stealth",
    rank: "rank",
    commands: "commands"
};
const prefix = '.';

const botIntents = [
    DIRECT_MESSAGES,
    GUILD_MESSAGES,
    GUILDS
];

module.exports = { botIntents, commands, prefix };
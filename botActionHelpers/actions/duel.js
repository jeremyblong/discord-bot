const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');

// "Send request to DM to duel..
// "You do NOT have enough coins!"
// "Selected user to duel with doesn't have enough coins!"
// "We have a WINNER!"
// "Error occurred while attempting to save appropriate data.."
// "You cannot use this action quite yet, hasn't been enough time!"
// "Send request to DM to duel.."

const duelPlayerCommand = async (authorID, guildID, channel, attackingUsername, authorUsername, client) => {
    console.log("duelPlayerCommand ran...");

    await axios.post(`${config.get("baseURLServer")}/duel/player/command`, {
        userID: authorID,
        guildID,
        attackingUsername,
        authorUsername
    }).then((res) => {
        if (res.data.message === "Send request to DM to duel..") {
            console.log(res.data);

            const { user, duelUserID } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`You've been invited to DUEL with ${user.username}, choose whether or not you'd like to duel WITHIN 7 DAYS!`).setDescription(`You MUST select/respond to this duel request WITHIN 7 days or you'll automatically duel this user. This is one of your 3 (three) options/chances to decline to duel. Choose wisely young padawan..`).setFooter("Choose whether or not you'd like to duel this user or ignore the request..");

            client.users.fetch(duelUserID, false).then((user) => {
                user.send({ embeds: [updatedCommand] });
            });

        } else {
            console.log("Err", res.data);

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to fetch the desired data..`).setDescription("An unknown error has occurred while attempting to fetch related the related data/coin's..").setFooter("Thanks for 'Looting-Player'!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = duelPlayerCommand;

// "Send request to DM to duel..
// "You do NOT have enough coins!"
// "Selected user to duel with doesn't have enough coins!"
// "We have a WINNER!"
// "Error occurred while attempting to save appropriate data.."
// "You cannot use this action quite yet, hasn't been enough time!"
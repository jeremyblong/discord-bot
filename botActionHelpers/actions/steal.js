const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

const sleepCommand = async (authorID, guildID, channel) => {
    console.log("sleepCommand ran...");

    await axios.post(`${config.get("baseURLServer")}/steal/random/users/command`, {
        userID: authorID,
        guildID
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log("first:", res.data);
            // desconstruct results
            const { user, userStolenArray } = res.data;
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`We've updated your account with the appropriate changes and added coins to your account..`).setDescription(`We've added 5 coin's to your account and your new total is ${user.coins} total coin's, congrats ${user.username}! Enjoy your new bounty/rewards from your successful '.steal'..`).addFields(userStolenArray).setFooter("Thanks for 'Stealing' - You may use this command again in another 4 (four) hours!");
            // send via channel related
            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "You're not able/allowed to 'steal' again yet... Please wait the full four hours before attempting to run this command again..") {
            console.log("Second chunk...:", res.data);

            // desconstruct results
            const { user } = res.data;

            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`You're NOT allowed to use the '.steal' command quite yet..!`).setDescription(`You can't use this specific command quite yet as you last used it ${moment(user.lastStealData.used).fromNow()} and you'll only be able to use it again starting at ${moment(user.lastStealData.used).add(user.lastStealData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")}, be patient until that time arrives & stay safe! Watch out for theives ;)`).setFooter(`You LAST USED this command approx. ${moment(user.lastStealData.used).fromNow()}`);
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        } else {
            console.log("thrid chunk..:", res.data);

            // desconstruct results
            const { user } = res.data;

            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`You're NOT allowed to use the '.steal' command quite yet..!`).setDescription(`An unknown error has occurred while attempting to '.steal' from random folks, maybe this is karma?! Who knows, if this problem persists though, please report it to an admin or system maintainer.`).setFooter(`You LAST USED this command approx. ${moment(user.lastStealData.used).fromNow()}`);
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = sleepCommand;
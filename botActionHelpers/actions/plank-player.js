const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");


const plankPlayerCommand = async (authorID, guildID, channel, attackingUsername, authorUsername) => {
    console.log("plankPlayerCommand ran...");

    await axios.post(`${config.get("baseURLServer")}/plank/player/command`, {
        userID: authorID,
        authorUsername,
        guildID,
        attackingUsername
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { user, username, coins } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`We've SUCCESSFULLY planked this player with the username of ${username}!`).setImage(`${config.get("awsCloudStorageAssetStartURL")}/plank.jpg`).setDescription(`We've deducted 20 coin's from your account due to this successful command and your remaining balance is now ${user.coins} coin's. The planked player has approx. ${coins} coin's in their account now as well. Congrats on your successful plank maty!`).setFooter("Thanks for 'Planking' this player!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "Author doesn't have enough coins to take this action!") {

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`YOU do NOT have enough coins (20 required coin's for this action) to complete this action..`).setDescription(`Unfortunately, you do NOT have enough coins to complete this action/command as you ONLY HAVE ${user.coins} coin's left in your account..`).setFooter("Thanks for 'Planking' this player!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "Selected user to plank doesn't have enough coins to take!") {

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`The selected planked-user does NOT have enough coins (20 required coin's for this action) to complete this action..`).setDescription(`Unfortunately, the SELECTED player does NOT have enough coins to complete this action/command, we did NOT modify your coin count and you still have ${user.coins} coin's left!`).setFooter("Thanks for 'Planking' this player!");

            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "It has NOT been enough time since your last use of this action/command..") {

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`It has NOT been enough time since you last took this action, please wait till the approriate time elapses..`).setImage(`${config.get("awsCloudStorageAssetStartURL")}/clock.jpg`).setDescription(`Unfortunately, it has NOT been long enough since you've last used this action/command at ${moment(user.plankActionData.used).format("MM/DD/YYYY hh:mm:ss a")}, you will be able to use this command next at ${moment(user.restActionData.used).add(user.restActionData.hoursTillNextUse, "hours").format("MM/DD/YYYY hh:mm:ss a")}..`).setFooter("Thanks for 'Planking' this player!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "An error occurred while attempting to update data and save...") {
            console.log("Err", res.data);

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to fetch & update the desired data..`).setDescription(`An unknown error has occurred while attempting to fetch related the related data/coin's - BOTH account balances (coin count) have remained the same and you still have approx. ${user.coins} coin's left!`).setFooter("Thanks for 'Planking' this player!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = plankPlayerCommand;
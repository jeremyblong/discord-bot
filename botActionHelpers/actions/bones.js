const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");
const _ = require("lodash");


const bonesCommand = async (authorID, guildID, channel) => {
    console.log("bonesCommand ran...");

    await axios.post(`${config.get("baseURLServer")}/bones/command`, {
        userID: authorID,
        guildID
    }).then((res) => {
        if (res.data.message === "We have a WINNER!") {
            console.log("WINNER!....:", res.data);
            // desconstruct results
            const { user } = res.data;
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#fcba03').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-karol-d-325154.jpg`).setTitle(`WE HAVE A WINNER! Congrat's, You've been awarded 10 coin's!`).setDescription(`Congratulations, You've successfulled 'rolled the dice' and WON 10 coin's! You will NOT be able to use this command again however until ${moment(user.bonesActionData.used).add(user.bonesActionData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")} but in the meantime... There are plenty of other commands to check out! Try not to gamble toooooo much, don't take all of our coins! :)`).setFooter(`You LAST USED this command approx. ${moment(user.bonesActionData.used).fromNow()}`);
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "Unfortunately you've NOT a winner..") {
            console.log("Unfortunately you've NOT a winner..", res.data);
            // desconstruct results
            const { user } = res.data;
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#fcba03').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-karol-d-325154.jpg`).setTitle(`Unfortunately you did not win the 'roll of the dice'...`).setDescription(`We regret to inform you that unfortunately, you decided to gamble and lost... This command gives you a 50/50 shot at doubling your waged bet (10 token's) and it can only be used again at ${moment(user.bonesActionData.used).add(user.bonesActionData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")}. Good luck on your next attempt (if you dare)!`).setFooter(`You LAST USED this command approx. ${moment(user.bonesActionData.used).fromNow()}`);
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "It hasn't been long enough since your last use of this command!") {
            console.log("not long enough since last use..:", res.data);
            // desconstruct results
            const { user } = res.data;
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#fffb00').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-karol-d-325154.jpg`).setTitle(`It has NOT been enough time since your last use of this command/request!`).setDescription(`Woah champ! You've already used this command in the last 6 hours, take a break for a bit and try this command again once it's been enough time since your last use at ${moment(user.bonesActionData.used).format("MM/DD/YYYY hh:mm:ss a")}, you last used this command ${moment(user.bonesActionData.used).fromNow()}...`).setFooter(_.has(user, "bonesActionData") && _.has(user.bonesActionData, "used") ? `You LAST USED this command approx. ${moment(user.bonesActionData.used).fromNow()}` : "An unknown error has occurred during this request/command-attempt.");
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "You do NOT have enough coins to .bones at the moment..") {
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#fc0303').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-karol-d-325154.jpg`).setTitle(`You do NOT have enough coins to take this action (10 coins required minimum)..`).setDescription(`Unfortunately, You do NOT have enough coins to take this action, try playing some other actions/games and see if you can aquire more coins! There are many ways to gain more coins so be sure to check the '.commands'!`).setFooter("You don't have enough coins to use this desired action, gain more coins and try this action again!");
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        } else {
            console.log("Unknown error has occurred..:", res.data);
            // desconstruct results
            const { user } = res.data;
            // create command to be sent
            const updatedCommand = new MessageEmbed().setColor('#fc0303').setTitle(`An unknown error has occurred while attempting to process this request.`).setDescription(`Unfortunately, for whatever reason, the desired request/command has failed to properly execute the required logic and you're NOT going to be charged anything for this transaction/bet. Please contact support or an admin if this issue persists...`).setFooter(_.has(user, "bonesActionData") && _.has(user.bonesActionData, "used") ? `You LAST USED this command approx. ${moment(user.bonesActionData.used).fromNow()}` : "An unknown error has occurred during this request/command-attempt.");
            // send via channel related
            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = bonesCommand;
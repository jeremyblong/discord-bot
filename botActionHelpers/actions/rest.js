const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

const restCommand = async (authorID, guildID, channel) => {
    console.log("restCommand ran...");

    const coinAddition = 1;

    await axios.post(`${config.get("baseURLServer")}/rest/command`, {
        userID: authorID,
        coinAddition,
        guildID
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`We've updated your account with the appropriate changes and you're now resting...!`).setDescription(`We've deducted ${coinAddition} coin(s) from your account and your new total is ${user.coins} total coin's, enjoy your nap/rest but rememeber ${user.username}, you will be susceptible to attack's in another 2 hours so be careful!`).setFooter("Thanks for 'Resting' - You may use this command again in another 8 hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "You're already resting, you cannot user this action quite yet..") {

            const { user, actionTaken } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`You're ALREADY resting! Take a chill pill and relax because you're safe for now :)`).setDescription(actionTaken === false ? `It has not been long enough since your last .scrub/.rest action (both activate resting period) so NO action has been taken. Please wait till the related 'command time' expires which would be your last '.scrub' or '.rest' command, whichever was used most recently, You still have ${user.coins} coin's..` : `It has NOT been the required 8 (eight) hours yet, please wait till the 8 hours passes from the date of ${moment(user.restActionData.used).add(8, "hours").format("MM/DD/YYYY hh:mm:ss a")} before you try to rest again - too much sleep can be unhealthy..`).setFooter("Check back soon to see when you can use this command again!");

            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "You do NOT have enough coins to rest at the moment..") {

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`You do NOT have enough coins to make/take this action! You only have ${user.coins} coins..`).setDescription("An unknown error has occurred while attempting to modify existing data & make appropriate changes..").setFooter("Thanks for 'Resting' - Unfortunately you did not have enough coins.");

            channel.send({ embeds: [updatedCommand] });
        } else {
            console.log("Err", res.data);

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to modify the desired data..`).setDescription("An unknown error has occurred while attempting to modify existing data & make appropriate changes..").setFooter("Thanks for 'Resting' - You may use this command again in another 8 hours!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = restCommand;
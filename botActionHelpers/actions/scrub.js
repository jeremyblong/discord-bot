const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

const scrubCommand = async (authorID, guildID, channel) => {
    console.log("scrubCommand ran...");

    const coinAddition = 5;

    await axios.post(`${config.get("baseURLServer")}/scrub/command`, {
        userID: authorID,
        coinAddition,
        guildID
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`We've updated your account with the appropriate changes and added coins to your account..`).setDescription(`We've added ${coinAddition} coin's to your account and your new total is ${user.coins} total coin's, congrats ${user.username}! Enjoy your new bounty/rewards..`).setFooter("Thanks for 'Scrubbing' - You may use this command again in another 6 (six) hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "It has NOT been 6 hours yet, please wait 6 hours before trying this action again...") {

            const { user } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`It hasn't been the required minimum 6 hours since your last use of this command yet...!`).setDescription(`It has NOT been the required 6 (six) hours yet, please wait till the 6 hours passes from the date of ${moment(user.lastScrubbedAction.lastScrubDate).add(6, "hours").format("MM/DD/YYYY hh:mm:ss a")}..`).setFooter("Check back soon to see when you can use this command again!");

            channel.send({ embeds: [updatedCommand] });
        } else {
            console.log("Err", res.data);

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to modify the desired data....`).setDescription("An unknown error has occurred while attempting to modify existing data & make appropriate changes..").setFooter("Thanks for 'Scrubbing' - You may use this command again in another 6 hours!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = scrubCommand;
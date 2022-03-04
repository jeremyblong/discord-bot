const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

const sleepCommand = async (authorID, guildID, channel) => {
    console.log("sleepCommand ran...");

    const coinAddition = 5;

    await axios.post(`${config.get("baseURLServer")}/sleep/command`, {
        userID: authorID,
        coinAddition,
        guildID
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`We've updated your account with the appropriate changes and you're now sleeping...!`).setDescription(`We've deducted ${coinAddition} coin(s) from your account and your new total is ${user.coins} total coin's, enjoy your nap/rest but rememeber ${user.username}, you will be susceptible to attack's in another 12 hours so be careful!`).setFooter("Thanks for 'Sleeping' - You may use this command again in another 12 hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "You're already sleeping or resting, you cannot user this action quite yet..") {
            
            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`You're ALREADY sleeping/resting! Take a chill pill and relax because you're safe for now :)`).setDescription(`It has NOT been the required 12 (twelve) hours yet, please wait until your 'resting period' wears off (cycles every 30 min so check back every half hour) before you try to rest again - too much sleep can be unhealthy..`).setFooter("Check back soon to see when you can use this command again!");

            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "You do NOT have enough coins to sleep at the moment..") {

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`You do NOT have enough coins to make/take this action! You only have ${user.coins} coins..`).setDescription("An unknown error has occurred while attempting to modify existing data & make appropriate changes..").setFooter("Thanks for 'Sleeping' - Unfortunately you did not have enough coins.");

            channel.send({ embeds: [updatedCommand] });
        } else {
            console.log("Err", res.data);

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to modify the desired data..`).setDescription("An unknown error has occurred while attempting to modify existing data & make appropriate changes..").setFooter("Thanks for 'Resting' - You may use this command again in another 12 hours!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = sleepCommand;
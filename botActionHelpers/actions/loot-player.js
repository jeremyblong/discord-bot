const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');

const lootPlayerCommand = async (guildID, channel, username) => {
    console.log("lootPlayerCommand ran...");

    await axios.get(`${config.get("baseURLServer")}/loot/player/coins/command`, {
        params: {
            guildID,
            username
        }
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { coins } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`You've looted the user with the username of ${username} resulting in a public display of their coin count of ${coins} coin's`).setDescription(`We've successfully gathered this user's coin count and the result was approximately ${coins} coin's which are linked to the user's account of - ${username}!`).setFooter("Thanks for 'Looting-Player'!");

            channel.send({ embeds: [updatedCommand] });

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

module.exports = lootPlayerCommand;
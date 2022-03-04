const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');

const lootCommand = async (authorID, guildID, channel) => {
    console.log("lootCommand ran...");

    await axios.get(`${config.get("baseURLServer")}/loot/coins/command`, {
        params: {
            userID: authorID,
            guildID
        }
    }).then((res) => {
        if (res.data.message === "Successfully executed desired action!") {
            console.log(res.data);

            const { coins } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#00bed4').setTitle(`You have approximately ${coins} coin's in your account!`).setDescription(`We've gathered ALL of your coins which amount to a grand total of ${coins} coin's associated with your account..`).setFooter("Thanks for 'Looting'!");

            channel.send({ embeds: [updatedCommand] });

        } else {
            console.log("Err", res.data);

            const updatedCommand = new MessageEmbed().setColor('#ff0011').setTitle(`An error occurred while attempting to fetch the desired data..`).setDescription("An unknown error has occurred while attempting to fetch related the related data/coin's..").setFooter("Thanks for 'Looting'!");

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = lootCommand;
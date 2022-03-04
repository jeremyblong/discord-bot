const axios = require("axios");
const config = require("config");
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

const snipePlayerCommand = async (authorID, guildID, channel, usernameToSnipe, authorUsername, headshot) => {
    console.log("snipePlayerCommand ran...");

    await axios.post(`${config.get("baseURLServer")}/snipe/player/command`, {
        userID: authorID,
        guildID,
        usernameToSnipe,
        authorUsername,
        headshot
    }).then((res) => {
        if (res.data.message === "User is frozen/sleeping - wasted shot.") {
            console.log("User is frozen/sleeping - wasted shot.", res.data);

            const { user } = res.data;

            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(`User is frozen or sleeping - shot wasted...`).setDescription(`You've shot at a player that is in fact resting/frozen & are currently 'untouchable' for the current point in time. If you really want to attack this person, check by and attack frequently to see if you can strike a hit!  You now have approx. ${user.coins} coin's left at your disposal.`).setFooter("Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "Successfully executed desired action HOWEVER missed user's shot!") {
            console.log("Successfully executed desired action HOWEVER missed user's shot!", res.data);

            const { user } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(`You've successfully shot at this user HOWEVER apparently your aim sucks and you missed..`).setDescription(`You've shot at this user & unfortunately missed, if you wish to attack this specific person, try another shot at this user in approx. 8 (eight) hours to see if you can manage a strike! You now have approx. ${user.coins} coin's left at your disposal.`).setFooter("Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.") {
            console.log("Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.", res.data);

            const { user } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(`You've successfully shot at this user HOWEVER they did NOT have enough coin's to steal/take.`).setDescription(`You've shot at this user and HIT, however... this user didn't have an adequate amount of coin's left to be taken therefore you haven't recieved any even though your shot connected. You now have approx. ${user.coins} coin's left at your disposal.`).setFooter("Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "An error has occurred while attempting to save at some point altered data..") {
            console.log("An error has occurred while attempting to save at some point altered data..", res.data);
            
            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(`An error occurred while attempting to munipulate data approriately...`).setDescription(`You've attempted to 'shoot' this user HOWEVER an error occurred during the attack process. We have NOT deducted any coin's from your account and no action was taken. Please try this action in again in 8 (eight) hours or try other actions.`).setFooter("Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours!");

            channel.send({ embeds: [updatedCommand] });

        } else if (res.data.message === "Successfully executed desired action & landed your shot!") {
            console.log("Successfully executed desired action & landed your shot!", res.data);
            
            const { user, headshot } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(typeof headshot !== "undefined" && headshot === true ? `HEADSHOT! You've landed a HEADSHOT, You've SUCCESSFULLY attacked this user & gained coin's in return from this action!` : `You've SUCCESSFULLY attacked this user & gained coin's in return from this action!`).setDescription(`You've successfully attacked/sniped this user & recieved coin's that we're stolen in exchange during this altercation. You may use this action again starting ${moment(user.snipeActionData.used).add(user.snipeActionData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")} and you now have a total of ${user.coins} coin's all-in-all! Congrats on your successful snipe!`).setFooter("Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours!");

            channel.send({ embeds: [updatedCommand] });
        } else if (res.data.message === "You haven't waited long enough to take this action again...") {

            const { user } = res.data;
            
            const updatedCommand = new MessageEmbed().setColor('#000').setImage(`${config.get("awsCloudStorageAssetStartURL")}/pexels-tima-miroshnichenko-6091153.jpg`).setTitle(`You need to wait longer until you can use this action again..`).setDescription(`You've already RECENTLY used this command and tried to 'snipe' someone BEFORE your 8 (eight) hour time limit is up, Please wait till this time expires at ${moment(user.snipeActionData.used).add(user.snipeActionData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")} and try this action again...!`).setFooter(`Thanks for 'Sniping' - You may use this command again in another 8 (eight) hours at ${moment(user.snipeActionData.used).add(user.snipeActionData.hoursTillNextUse, 'hours').format("MM/DD/YYYY hh:mm:ss a")}!`);

            channel.send({ embeds: [updatedCommand] });
        }
    }).catch((err) => {
        console.log(err);

        return "An unknown error has occurred while attempting to modify existing data & make appropriate changes..";
    })
}

module.exports = snipePlayerCommand;
const { commands, prefix } = require("../config/config.js");
const { getLastMsgs } = require("../botActionHelpers/msgRelated/getLastMessages.js");
const axios = require("axios");
const { MessageEmbed } = require('discord.js');
const config = require("config");
const scrubCommand = require("../botActionHelpers/actions/scrub.js");
const restCommand = require("../botActionHelpers/actions/rest.js");
const { intervalHelper } = require("../utils/general.js");
const { client } = require("./client.js");
const sleepCommand = require("../botActionHelpers/actions/sleep.js");
const stealCommand = require("../botActionHelpers/actions/steal.js");
const bonesCommand = require("../botActionHelpers/actions/bones.js");
const pokerCommand = require("../botActionHelpers/actions/poker.js");
const snipePlayerCommand = require("../botActionHelpers/actions/snipe.js");
const lootCommand = require("../botActionHelpers/actions/loot.js");
const lootPlayerCommand = require("../botActionHelpers/actions/loot-player.js");
const duelPlayerCommand = require("../botActionHelpers/actions/duel.js");
const plankPlayerCommand = require("../botActionHelpers/actions/plank-player.js");



let interval = null;

const registerClient = () => {
    client.on('ready', async () => {
        console.log('Logged in as ' + client.user);
        
        interval = setInterval(() => intervalHelper(client, interval), 1000);
    });
    
    client.on('inviteCreate', async invite => {
      console.log("invite created!...:", invite);
    })
    
    client.on("guildMemberAdd", async member => {
        console.log("member", member);

        const guildID = member.guild.id;

        const { id, bot, system, flags, username, discriminator, avatar, banner } = member.user;

        const user = {
            id,
            bot,
            system,
            flags,
            username,
            discriminator,
            avatar,
            banner
        };
        
        const configuration = {
          params: {
              user,
              guildID
          }
        };

        const dbConfig = config.get('baseURLServer');
      
        axios.get(`${dbConfig}/save/newly/joined/member/appropriate/guild`, configuration).then((res) => {

            if (res.data.message === "Successfully saved user data!") {
              console.log("SUCCESSFULLY SAVED USER...:", res.data);

              const { result } = res.data;

              return result;
              
              // return guildChannel.send(`Welcome to the chat - ${result.username}! Everyone, say hello to our new guest...`);
            } else {
              console.log("Err", res.data);
            }
        }).catch((err) => {
            console.log("Critical err:", err);
        })
    });
    
    client.on("guildMemberRemove", member => {
      console.log("guildMemberRemove removed - memeber: ", member);
    });
    
    client.on("guildCreate", (guild) => {
      console.log("guildCreate running...");
      // Filtering the channels to get only the text channels.
      // const Channels = guild.channels.cache.filter(channel => channel.type == "text");
    
      // // Creating an invite.
      // Channels.first().createInvite({
      //     maxUses: 1,
      //     unique: true
      // }).then(invite => {
      //     console.log(`[INVITE] I've created an invite for ${guild.id}:${guild.name} - ${invite.url}`);
      // });
    });
    
    client.on('guildMemberAdd', member => {
        console.log("member", member);
    });
    
    client.on('messageCreate', async (msg) => {

      // console.log("msg messageCreate :", msg);

      if (msg.author.bot) return;
      if (!msg.content.startsWith(prefix)) return; // do nothing if command is not preceded with prefix
      
      const userCmd = msg.content.slice(prefix.length);
      const args = msg.content.split(' ');
      const guildID = msg.guildId;
      const authorID = msg.author.id;
      const authorUsername = msg.author.username;
      const channel = msg.channel;
  
      console.log("userCmd", userCmd);
      
      switch (userCmd) {
          case commands.getName:
            return msg.reply(msg.author.username);
            break;
          case commands.tellJoke:
            const jokeResponse = new MessageEmbed().setColor('#E00C49').setTitle(`I'm bout' to tell a joke, you ready?`).setDescription('HTML is a scripting language && this is all you need to succeed in life. #lowCode #NoCode').setFooter('Thanks for interacting with our custom discord chat bot!');
            msg.channel.send({ embeds: [jokeResponse] });
            break;
          case commands.sad:
            const sadCommand = new MessageEmbed().setColor('#0C1CE0').setTitle(`I'm going to tell you a sad #fact...`).setDescription("Don't be sad, depression is normal...  many people are sad cause they suck at coding/engineering, reach out on stack overflow for treatment options!").setFooter('Thanks for interacting with our custom discord chat bot!');
            msg.channel.send({ embeds: [sadCommand] });
            break;
          case commands.lastMsgs:
            const reply = await getLastMsgs(msg);
            return msg.author.send({ embeds: reply });
            break;
          case commands.scrub:
            return await scrubCommand(authorID, guildID, channel);
            break;
          case commands.rest:
            return await restCommand(authorID, guildID, channel);
            break;
          case commands.sleep:
            return await sleepCommand(authorID, guildID, channel);
            break;
          case commands.steal: 
            return await stealCommand(authorID, guildID, channel);
            break;
          case commands.bones:
            return await bonesCommand(authorID, guildID, channel);
            break;
          case commands.poker:
            return await pokerCommand(authorID, guildID, channel);
            break;
          case commands.loot:
            return await lootCommand(authorID, guildID, channel);
            break;
          case commands.duel: 

            const duelPlayerFilter = m => m.content.toLowerCase();

            const duelPlayerCollectUsername = channel.createMessageCollector(duelPlayerFilter, { time: 20000, max: 1 });

            const duelPlayerCommandEmbed = new MessageEmbed().setColor('#067813').setTitle(`Please enter the 'username' of the user you'd like to DUEL! Please note: You must enter a valid username or this command will do nothing (upper-lowercase does NOT matter, just accuracy)...`).setFooter(`Please enter a user's username before the 20 seconds expire.`);
            // send via channel related
            channel.send({ embeds: [duelPlayerCommandEmbed] });

            duelPlayerCollectUsername.on('collect', async data => {
              console.log(`Collected username is: ${data.content}`);

              const username = data.content;

              if (typeof username !== "undefined" && username.length > 0) {
                duelPlayerCollectUsername.stop(username);
              } 
            });

            duelPlayerCollectUsername.on('end', async (collected, username) => {
              return await duelPlayerCommand(authorID, guildID, channel, username, authorUsername, client);
            });
            break;
          case commands.lootPlayer:

            const lootPlayerFilter = m => m.content.toLowerCase();

            const lootPlayerCollector = channel.createMessageCollector(lootPlayerFilter, { time: 20000, max: 1 });

            const lootPlayerCommandEmbed = new MessageEmbed().setColor('#067813').setTitle(`What user (Username) would you like to display the coin count of? Please note: You must enter a valid username or this command will do nothing (upper-lowercase does NOT matter, just accuracy)...`).setFooter(`Please enter a user's username before the 20 seconds expire.`);
            // send via channel related
            channel.send({ embeds: [lootPlayerCommandEmbed] });

            lootPlayerCollector.on('collect', async data => {
              console.log(`Collected username is: ${data.content}`);

              const username = data.content;

              if (typeof username !== "undefined" && username.length > 0) {
                lootPlayerCollector.stop(username);
              } 
            });

            lootPlayerCollector.on('end', async (collected, username) => {
              return await lootPlayerCommand(guildID, channel, username);
            });
            break;
          case commands.snipe:

            const filter = m => m.content.toLowerCase();

            const collector = channel.createMessageCollector(filter, { time: 15000, max: 1 });

            const filterAiming = m => m.content.toLowerCase();

            const collectorAimingQuestion = channel.createMessageCollector(filterAiming, { time: 15000, max: 1 });

            console.log("collector started");

            const updatedCommand = new MessageEmbed().setColor('#067813').setTitle(`What user (Username) would you like to 'snipe'? Please note: You must enter a valid username or you will waste your coin's (upper-lowercase does NOT matter, just accuracy)...`).setFooter(`Please enter a user's username before the 20 seconds expire.`);
            // send via channel related
            channel.send({ embeds: [updatedCommand] });

            collector.on('collect', async data => {
              console.log(`Collected username is: ${data.content}`);

              const username = data.content;

              if (typeof username !== "undefined" && username.length > 0) {
                collector.stop(username);
              } 
            });

            collector.on('end', (collected, username) => {
              const aimingPrompt = new MessageEmbed().setColor('#067813').setTitle(`Please enter 'yes' or 'no' whether you'd like to 'AIM' on this shot to get more accuracy?`).setDescription(`You can use this command UP-TO 5 times TOTAL throughout your entire experience on this platform however it will INCREASE a 'headshot' chance/liklihood while costing 1 coin!`).setFooter(`Enter 'yes' or 'no' before the 20 seconds expire.`);
              // send via channel related
              channel.send({ embeds: [aimingPrompt] });
              
              collectorAimingQuestion.on("collect", async extra => {

                const typedResponse = extra.content.toLowerCase();
          
                if (typedResponse === "yes" || typedResponse === "no") {                  
                  collectorAimingQuestion.stop(typedResponse)
                }
              });

              collectorAimingQuestion.on('end', async (collected, headshot) => {
                return await snipePlayerCommand(authorID, guildID, channel, username, authorUsername, headshot); 
              });
            });

            break;
          case commands.plank: 

            const plankPlayerFilter = m => m.content.toLowerCase();

            const plankPlayerCollector = channel.createMessageCollector(plankPlayerFilter, { time: 20000, max: 1 });

            const plankPlayerCommandEmbed = new MessageEmbed().setColor('#067813').setTitle(`Please enter the 'username' of the user you'd like to PLANK (ARG MATY!!)! Please note: You must enter a valid username or this command will do nothing (upper-lowercase does NOT matter, just accuracy)...`).setFooter(`Please enter a user's username before the 20 seconds expire.`);
            // send via channel related
            channel.send({ embeds: [plankPlayerCommandEmbed] });

            plankPlayerCollector.on('collect', async data => {
              console.log(`Collected username is: ${data.content}`);

              const username = data.content;

              if (typeof username !== "undefined" && username.length > 0) {
                plankPlayerCollector.stop(username);
              } 
            });

            plankPlayerCollector.on('end', async (collected, username) => {
              return await plankPlayerCommand(authorID, guildID, channel, username, authorUsername);
            });
            break;
          default:
              return msg.reply('I do not understand your command');
              break;
      }
  });
}

module.exports = {
  registerClient
};
const { commands, prefix } = require("../config/config.js");
const { getLastMsgs } = require("../botActionHelpers/msgRelated/getLastMessages.js");
const axios = require("axios");
const { MessageEmbed } = require('discord.js');
const config = require("config");

const registerClient = (client) => {
    client.on('ready', async () => {
        console.log('Logged in as ' + client.user);
    
        setTimeout(() => {
          const { user } = client;
    
          const configuration = {
            params: {
              user
            }
          }
          const dbConfig = config.get('baseURLServer');
    
          axios.get(`${dbConfig}/get/user/info/save`, configuration).then((res) => {
            if (res.data.message === "Successfully saved user data!") {
              console.log("SUCCESSFULLY SAVED USER...:", res.data);
            } else {
              console.log("Err", res.data);
            }
          }).catch((err) => {
            console.log("Critical err:", err);
          })
        }, 1750);
    });
    
    client.on('inviteCreate', async invite => {
      console.log("invite created!...:", invite);
    })
    
    client.on("guildMemberAdd", (member) => {
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
        }
        const dbConfig = config.get('baseURLServer');
        
        axios.get(`${dbConfig}/save/newly/joined/member/appropriate/guild`, configuration).then((res) => {
            if (res.data.message === "Successfully saved user data!") {
            console.log("SUCCESSFULLY SAVED USER...:", res.data);
            } else {
            console.log("Err", res.data);
            }
        }).catch((err) => {
            console.log("Critical err:", err);
        })
    });
    
    client.on("guildMemberRemove", (member) => {
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
        if (msg.author.bot) return;
        if (!msg.content.startsWith(prefix)) return; // do nothing if command is not preceded with prefix
        
        const userCmd = msg.content.slice(prefix.length);
        const args = msg.content.split(' ');
    
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
            // case commands.invite:
            //   const guildInviteManager = msg.guild.invites;
    
            //   const { guild } = msg.channel;
    
            //   const guildMemberManager = guild.channels.guild.members;
    
            //   console.log("guild.channels", guild.channels);
    
            //   let filter = (msg) => !msg.author.bot;
            //   // Set our options to expect 1 message, and timeout after 15 seconds
            //   let optionsCollector = {
            //     max: 1,
            //     time: 15000
            //   };
            //   let collector = msg.channel.createMessageCollector(filter, optionsCollector);
    
            //   collector.on('collect', msg => { 
            //     console.log("message collected...", msg);
    
            //     if (msg.author.bot === false) {
            //       let username = msg.content;
    
            //       const guildID = msg.guildId;
            //       const channelID = msg.channelId;
    
            //       const customPromise = new Promise( async (resolve, reject) => {
            //         const guild = await client.guilds.fetch(guildID);
            //         const channel = await guild.channels.cache.get(channelID);
            //         const invite = await channel.createInvite({
            //           maxUses: 1,
            //           targetUser: {
            //             username
            //           },
            //           reason: "Someone has invited you to a channel/server to particpate in the related chat!"
            //         });
            //         resolve({
            //           link: `https://discord.gg/${invite.code}`,
            //           channel
            //         });
            //       })
    
            //       customPromise.then((passedData) => {
            //         console.log("passedData", passedData);
    
            //         const { link, channel } = passedData;
    
            //         msg.channel.send(`Copy this link - ${link} - send it to the person you'd like to invite to this guild/group!`);
            //       })
            //     }
            //   });
        
            //   collector.on('end', (collected, reason) => {
            //     console.log("reason collected", reason, collected);
            //   });
    
            //   msg.reply(`Who/What is the USERNAME of the user you'd like to invite?!`);
    
            //   break;
            default:
                return msg.reply('I do not understand your command');
                break;
        }
    });
}

module.exports = registerClient;
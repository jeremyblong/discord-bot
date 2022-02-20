const express = require("express");
const app = express();
const config = require("config");
const bodyParser = require('body-parser');
const cors = require("cors");
const xss = require('xss-clean');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require("express-rate-limit");
const aws = require('aws-sdk');
// const passport = require("passport");
const { Connection } = require("./mongoUtil.js");
const flash = require('connect-flash');
const session = require('express-session');
const { MessageEmbed, Intents, MessagePayload } = require('discord.js');
const { botIntents, commands, prefix } = require('./config/config.js');
const { getLastMsgs } = require("./botActionHelpers/msgRelated/getLastMessages.js");
const { startBot } = require("./botActionHelpers/startBot/initializeBot.js");
const path = require("path");
const { client } = require("./utils/discordAPI.js");
const axios = require("axios");

const PORT = process.env.PORT || 50451;


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

// client.on("guildCreate", (guild) => {
//   console.log("guildCreate running...");
//   // Filtering the channels to get only the text channels.
//   const Channels = guild.channels.cache.filter(channel => channel.type == "text");

//   // Creating an invite.
//   Channels.first().createInvite({
//       maxUses: 1,
//       unique: true
//   }).then(invite => {
//       console.log(`[INVITE] I've created an invite for ${guild.id}:${guild.name} - ${invite.url}`);
//   });
// });

startBot(client);

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
        case commands.invite:
          const guildInviteManager = msg.guild.invites;

          const { guild } = msg.channel;

          const guildMemberManager = guild.channels.guild.members;

          console.log("guild.channels", guild.channels);

          let filter = (msg) => !msg.author.bot;
          // Set our options to expect 1 message, and timeout after 15 seconds
          let optionsCollector = {
            max: 1,
            time: 15000
          };
          let collector = msg.channel.createMessageCollector(filter, optionsCollector);

          collector.on('collect', msg => { 
            console.log("message collected...", msg);

            if (msg.author.bot === false) {
              let username = msg.content;

              const guildID = msg.guildId;
              const channelID = msg.channelId;

              const customPromise = new Promise( async (resolve, reject) => {
                const guild = await client.guilds.fetch(guildID);
                const channel = await guild.channels.cache.get(channelID);
                const invite = await channel.createInvite({
                  maxUses: 1,
                  targetUser: {
                    username
                  },
                  reason: "Someone has invited you to a channel/server to particpate in the related chat!"
                });
                resolve({
                  link: `https://discord.gg/${invite.code}`,
                  channel
                });
              })

              customPromise.then((passedData) => {
                console.log("passedData", passedData);

                const { link, channel } = passedData;

                // channel.send(link);

                const fetchUser = async id => {
                  const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
                    headers: {
                      Authorization: `Bot ${token}`
                    }
                  })
                  if (!response.ok) throw new Error(`Error status code: ${response.status}`)
                  return JSON.parse(await response.json())
                }

                axios.post(`/users/@me/channels`).then((res) => {
                  console.log(res.data);
                }).catch((err) => {
                  console.log("error sending DM...:", err);
                })
              })
            }
          });
  
          collector.on('end', (collected, reason) => {
            console.log("reason collected", reason, collected);
          });

          msg.reply(`Who/What is the USERNAME of the user you'd like to invite?!`);

          // console.log("msg.guild: ", guildInviteManager);

          break;
        default:
          return msg.reply('I do not understand your command');
          break;
    }
});


aws.config.update({
    secretAccessKey: config.get("awsSecretKey"),
    accessKeyId: config.get("awsAccessKey"),
    region: config.get("awsRegion")
});

app.use(bodyParser.json({
	limit: "500mb"
}));
app.use(bodyParser.urlencoded({
	limit: "500mb",
	extended: false
}));

const corsOptions = {
	origin: "*",
	credentials: true,
  optionSuccessStatus: 200
};

app.use(flash());

app.use(session({ 
	cookie: { 
		maxAge: 60000 
	}, 
	secret: 'woot',
	resave: false, 
	saveUninitialized: false
}));
  
app.use(cors(corsOptions));

// app.use(passport.initialize());

const limiter = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000 * 1000, // remove the last 1000 for production
    message: 'Too many requests' // message to send
}); 

app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);

app.use(cors({ origin: 'http://localhost:50451' }));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	next();
});

app.use("/api/discord/login", require("./routes/discordRelated/auth/init/mainDiscord.js"));
app.use("/api/discord/callback", require("./routes/discordRelated/auth/callback/callback.js"));
app.use("/get/user/info/save", require("./routes/authentication/register/registerNewUserDB.js"));
app.use("/add/new/user/group", require("./routes/discordRelated/addUserGroup/addNewUser/newUser.js"));

app.use(express.static("dist"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.get('*', cors(), (_, res) => {
	res.sendFile(__dirname, 'client/dist/index.html'), (err) => {
	  if (err) {
		res.status(500).send(err)
	  };
	};
});
    
app.get('/*', cors(), (_, res) => {
	res.sendFile(__dirname, 'client/dist/index.html'), (err) => {
		if (err) {
		res.status(500).send(err)
		};
	};
});

Connection.open();

client.login(config.get("discordToken"));


app.listen(PORT, () => {
	console.log(`app listening on port ${PORT}!`);
});
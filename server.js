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
const { MessageEmbed, Intents } = require('discord.js');
const { botIntents, commands, prefix } = require('./config/config.js');
const { getLastMsgs } = require("./botActionHelpers/msgRelated/getLastMessages.js");
const { startBot } = require("./botActionHelpers/startBot/initializeBot.js");
const path = require("path");
const { client } = require("./utils/discordAPI.js");

const PORT = process.env.PORT || 50451;



client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);
});

startBot(client);

client.on('guildMemberAdd', member => {
  console.log("member", member);
});

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return; // do nothing if command is not preceded with prefix
  
    const userCmd = msg.content.slice(prefix.length);

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
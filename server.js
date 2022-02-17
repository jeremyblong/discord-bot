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
const { Client, MessageEmbed } = require('discord.js');
const { botIntents, commands, prefix } = require('./config/config.js');
const { getLastMsgs } = require("./botActionHelpers/msgRelated/getLastMessages.js");
const { startBot } = require("./botActionHelpers/startBot/initializeBot.js");
const path = require("path");

const PORT = process.env.PORT || 50451;



const client = new Client({
    intents: botIntents,
    partials: ['CHANNEL', 'MESSAGE'],
});

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);
});

startBot(client);

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

const whitelist = config.get("WHITELISTED_DOMAINS") ? config.get("WHITELISTED_DOMAINS").split(",") : [];

const corsOptions = {
	origin: function (origin, callback) {
	  if (!origin || whitelist.indexOf(origin) !== -1) {
		callback(null, true)
	  } else {
		callback(new Error("Not allowed by CORS"))
	  }
	},
	credentials: true,
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

app.use(express.static(__dirname + "/dist"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/public', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/public', 'index.html'));
});

app.get('*', cors(), (_, res) => {
	res.sendFile(__dirname, 'client/dist/public/index.html'), (err) => {
	  if (err) {
		res.status(500).send(err)
	  };
	};
});
    
app.get('/*', cors(), (_, res) => {
	res.sendFile(__dirname, 'client/dist/public/index.html'), (err) => {
		if (err) {
		res.status(500).send(err)
		};
	};
});

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
	next();
});

Connection.open();

client.login(config.get("discordToken"));

app.listen(PORT, () => {
	console.log(`app listening on port ${PORT}!`);
});
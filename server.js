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
const { startBot } = require("./botActionHelpers/startBot/initializeBot.js");
const path = require("path");
const { client } = require("./utils/client.js");
const registerClient = require("./utils/actions.js");

const PORT = process.env.PORT || 50451;

// discord bot permission === 8

startBot(client);

registerClient(client);

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
app.use("/save/newly/joined/member/appropriate/guild", require("./routes/discordRelated/guildLogic/saveMemberToGuild/newMember/addNewMemberToGuildDB.js"));

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
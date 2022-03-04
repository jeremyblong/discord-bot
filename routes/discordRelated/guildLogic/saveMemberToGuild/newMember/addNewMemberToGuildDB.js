const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../../mongoUtil.js");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');


router.get('/', async (req, res) => {

    const { 
        user,
        guildID 
    } = req.query;

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    console.log(req.body);

    const dynamicSchemaSaveNewGuildUserSchema = require("../../../../../schemas/auth/register/newGuildMember/register.js")(guildID);

    const parsed = JSON.parse(user);

    const newToSaveObject = {...parsed, guildID, coins: 0, resting: false, frozen: false, username: parsed.username.toLowerCase(), remainingDuelRefusalsLeft: [
        {
            id: uuidv4(),
            pending: true,
            accepted: false,
            userID: parsed.id,
            creationDate: new Date(),
            lastModified: null,
            actionTaken: false
        },
        {
            id: uuidv4(),
            pending: true,
            accepted: false,
            userID: parsed.id,
            creationDate: new Date(),
            lastModified: null,
            actionTaken: false
        },
        {
            id: uuidv4(),
            pending: true,
            accepted: false,
            userID: parsed.id,
            creationDate: new Date(),
            lastModified: null,
            actionTaken: false
        }
    ], joined: moment(new Date()).format("MM/DD/YYYY hh:mm:ss a") };

    const newSave = new dynamicSchemaSaveNewGuildUserSchema(newToSaveObject);

    const foundOrNot = await collection.findOne({ id: parsed.id });

    if (foundOrNot === null) {
        newSave.save(user, (err, result) => {
            if (err) {
                console.log("err", err);
            } else {
                console.log("result", result);

                res.json({
                    message: "Successfully saved user data!",
                    result
                })
            }
        })
    } else {
        console.log("already exists!");
    }
});

module.exports = router;
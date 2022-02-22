const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../../mongoUtil.js");


router.get('/', async (req, res) => {

    const { 
        user,
        guildID 
    } = req.query;

    console.log(req.body);

    const dynamicSchemaSaveNewGuildUserSchema = require("../../../../../schemas/auth/register/newGuildMember/register.js")(guildID);

    const parsed = JSON.parse(user);

    const newToSaveObject = {...parsed, guildID };

    const newSave = new dynamicSchemaSaveNewGuildUserSchema(newToSaveObject);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    const foundOrNot = await collection.findOne({ id: parsed.id });

    if (foundOrNot === null) {
        newSave.save(user, (err, result) => {
            if (err) {
                console.log("err", err);
            } else {
                console.log("result", result);
            }
        })
    } else {
        console.log("already exists!");
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const { v4: uuidv4 } = require('uuid');


router.get('/', async (req, res) => {

    const {} = req.query;

    const guildIDArray = [];

    Connection.db.db("myFirstDatabase").listCollections().toArray((err, individualCollection) => {
        // collInfos is an array of collection info objects that look like:
        console.log("individualCollection", individualCollection);  
        
        if (individualCollection.name !== "admins") {
            guildIDArray.push(individualCollection.name);
        }
    });

    console.log("guilds", guildIDArray);
});

module.exports = router;
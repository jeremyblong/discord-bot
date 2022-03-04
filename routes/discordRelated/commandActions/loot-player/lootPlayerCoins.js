const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const { v4: uuidv4 } = require('uuid');


router.get('/', async (req, res) => {

    const { 
        guildID,
        username
    } = req.query;

    console.log("req.body", req.body);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    collection.findOne({ username }).then((user) => {
        if (!user) {
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting to update data and save..."
            });
        } else {
            console.log("Successfully located user...:", user);

            const { coins } = user;

            res.json({
                message: "Successfully executed desired action!",
                coins
            })
        }
    })
});

module.exports = router;
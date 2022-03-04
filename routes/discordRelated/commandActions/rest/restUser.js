const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const { v4: uuidv4 } = require('uuid');


router.post('/', async (req, res) => {

    const { 
        guildID,
        userID,
        coinAddition
    } = req.body;

    console.log("req.body", req.body);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    collection.findOne({ id: userID }).then((user) => {
        if (!user) {
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting to update data and save..."
            });
        } else {
            console.log("Successfully located user...:", user);

            if (user.coins > 0) {
                if (user.resting === false && user.frozen === false) {
                    // freeze user from other's actions, stealing, etc..
                    user.frozen = true;
                    // mark resting as true..
                    user.resting = true;
                    // add one coin to count
                    user.coins -= coinAddition;
                    // create & update saved data restActionData
                    const newAction = {
                        id: uuidv4(),
                        used: new Date(),
                        hoursTillNextUse: 2
                    };
                    // update rest action..
                    user["restActionData"] = newAction;
                    // save modified data
                    collection.save(user, (error, result) => {
                        if (error) {
                            console.log("ERR saving..:", error);
    
                            res.json({
                                message: "An error occurred while attempting to update data and save...",
                                err: error
                            })
                        } else {
                            res.json({
                                message: "Successfully executed desired action!",
                                user,
                                actionTaken: true
                            })
                        }
                    })
                } else {
                    res.json({
                        message: "You're already resting, you cannot user this action quite yet..",
                        user,
                        actionTaken: false
                    })
                }
            } else {
                res.json({
                    message: "You do NOT have enough coins to rest at the moment..",
                    user,
                    actionTaken: false
                })
            }
        }
    })
});

module.exports = router;
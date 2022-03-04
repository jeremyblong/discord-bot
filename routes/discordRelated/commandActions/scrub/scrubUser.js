const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const _ = require("lodash");
const moment = require("moment");
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

            if (_.has(user, "lastScrubbedAction")) {
                const lastDate = new Date(user.lastScrubbedAction.lastScrubDate);

                const compareDate = new Date(lastDate.setHours(lastDate.getHours() + 6));
                // check if the last action date is after given point in time
                if (new Date(lastDate) > compareDate) {
                    // add to coin count
                    user.coins += coinAddition;
                    // set last action date to current point in time..
                    user.lastScrubbedAction.lastScrubDate = new Date();
                    // save updated data...
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
                                user
                            })
                        }
                    })
                } else {
                    res.json({
                        message: "It has NOT been 6 hours yet, please wait 6 hours before trying this action again...",
                        user
                    })
                }
            } else {
                // add scrub object
                const newScrubAction = {
                    id: uuidv4(),
                    lastScrubDate: new Date()
                }
                user["lastScrubbedAction"] = newScrubAction;
                // add to coin count
                user.coins += coinAddition;
                // save updated data...
                collection.save(user, (error, result) => {
                    if (error) {
                        console.log("ERR saving..:", error);

                        res.json({
                            message: "An error occurred while attempting to update data and save...",
                            err: error
                        })
                    } else {
                        console.log("result", result);

                        res.json({
                            message: "Successfully executed desired action!",
                            user
                        })
                    }
                })
            }
        }
    })
});

module.exports = router;
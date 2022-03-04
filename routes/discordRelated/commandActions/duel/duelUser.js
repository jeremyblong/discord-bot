const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const _ = require("lodash");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');


router.post('/', async (req, res) => {

    const { 
        userID,
        authorUsername,
        guildID,
        attackingUsername
    } = req.body;

    console.log("req.body", req.body);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    collection.find({ username: { $in: [ authorUsername, attackingUsername ] }}).toArray(async (err, users) => {
        if (err) { 
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting find & update related user's..",
                err
            });
        } else {
            console.log("Successfully located user...:", users);

            const findAuthorIndex = users.findIndex(x => x.username === authorUsername);
            const findDueledUserIndex = users.findIndex(x => x.username === attackingUsername);

            const dueledUser = users[findDueledUserIndex];
            const authorUser = users[findAuthorIndex];

            const newDuelActionData = {
                id: uuidv4(),
                used: new Date(),
                hoursTillNextUse: 48
            };

            const generatedBetween = Math.floor(Math.random() * (2 - 1 + 1) + 1);
            // check if user has refusals left
            if (_.has(dueledUser, "remainingDuelRefusalsLeft") && dueledUser.remainingDuelRefusalsLeft.length > 0) {
                res.json({
                    message: "Send request to DM to duel..",
                    user: authorUser,
                    duelUserID: dueledUser.id
                })
            } else {
                if (_.has(authorUser, "duelActionData")) {
                    if ((new Date(authorUser.duelActionData.used) > new Date(authorUser.duelActionData.used.setHours(authorUser.duelActionData.used.getHours() + authorUser.duelActionData.hoursTillNextUse)))) {
                        // make sure author/signed-in user has at least half the amount of dueled user coins..
                        if ((authorUser.coins / 2) >= dueledUser.coins) {
                            // challenge to duel..
                            if (generatedBetween === 1) {
                                // WINS!
                                authorUser.coins += (dueledUser.coins / 4) // steal 25% of their coins upon success..
    
                                dueledUser.coins -= (dueledUser.coins / 4); // duelActionData
    
                                const savingPromise = new Promise((resolve, reject) => {
                                    // save author then dueler..
                                    collection.save(authorUser, (err, result) => {
                                        if (err) {
                                            console.log("error occurred while saving..:", err);
    
                                            res.json({
                                                message: "Error occurred while attempting to save appropriate data..",
                                                err
                                            })
                                        } else {
                                            console.log("successfully saved and updated!");
    
                                            resolve();
                                        }
                                    })
                                })
    
                                savingPromise.then((passedData) => {
                                    // save dueler..
                                    collection.save(dueledUser, async (err, result) => {
                                        if (err) {
                                            console.log("error occurred while saving..:", err);
    
                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: authorUser.id }, { $inc: { coins: (dueledUser.coins / 4) }});
    
                                            if (savedOrNotSniped) {
                                                res.json({
                                                    message: "Error occurred while attempting to save appropriate data..",
                                                    err
                                                })
                                            }
                                        } else {
                                            console.log("successfully saved and updated!");
    
                                            res.json({
                                                message: "We have a WINNER!",
                                                user: authorUser
                                            })
                                        }
                                    })
                                })
                            } else {
                                // LOSES...
                                authorUser["duelActionData"] = newDuelActionData;
                                // save author then dueler..
                                collection.save(authorUser, (err, result) => {
                                    if (err) {
                                        console.log("error occurred while saving..:", err);

                                        res.json({
                                            message: "Error occurred while attempting to save appropriate data..",
                                            err
                                        })
                                    } else {
                                        console.log("successfully saved and updated!");

                                        res.json({
                                            message: "You LOST the duel!",
                                            user: authorUser
                                        })
                                    }
                                })
                            }
                        } else {
                            // return doesnt have enough coins..
                            res.json({
                                message: "Selected user to duel with doesn't have enough coins!",
                                user: authorUser
                            })
                        }
                    } else {
                        res.json({
                            message: "You cannot use this action quite yet, hasn't been enough time!",
                            user: authorUser
                        })
                    }
                } else {
                    // make sure author/signed-in user has at least half the amount of dueled user coins..
                    if ((authorUser.coins / 2) >= dueledUser.coins) {
                        // challenge to duel..
                        if (generatedBetween === 1) {
                            // WINS!
                            authorUser.coins += (dueledUser.coins / 4) // steal 25% of their coins upon success..
    
                            dueledUser.coins -= (dueledUser.coins / 4); // duelActionData
    
                            authorUser["duelActionData"] = newDuelActionData;
    
                            const savingPromise = new Promise((resolve, reject) => {
                                // save author then dueler..
                                collection.save(authorUser, (err, result) => {
                                    if (err) {
                                        console.log("error occurred while saving..:", err);
    
                                        res.json({
                                            message: "Error occurred while attempting to save appropriate data..",
                                            err
                                        })
                                    } else {
                                        console.log("successfully saved and updated!");
    
                                        resolve();
                                    }
                                })
                            })
    
                            savingPromise.then((passedData) => {
                                // save dueler..
                                collection.save(dueledUser, async (err, result) => {
                                    if (err) {
                                        console.log("error occurred while saving..:", err);
    
                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: authorUser.id }, { $inc: { coins: (dueledUser.coins / 4) }});
    
                                        if (savedOrNotSniped) {
                                            res.json({
                                                message: "Error occurred while attempting to save appropriate data..",
                                                err
                                            })
                                        }
                                    } else {
                                        console.log("successfully saved and updated!");
    
                                        res.json({
                                            message: "We have a WINNER!",
                                            user: authorUser
                                        })
                                    }
                                })
                            })
                        } else {
                            // LOSES...
    
                            res.json({
                                message: "You do NOT have enough coins!",
                                user: authorUser
                            })
                        }
                    } else {
                        // return doesnt have enough coins..
                        res.json({
                            message: "Selected user to duel with doesn't have enough coins!",
                            user: authorUser
                        })
                    }
                }
            }
        }
    })
});

module.exports = router;
// "Send request to DM to duel..
// "You do NOT have enough coins!"
// "Selected user to duel with doesn't have enough coins!"
// "We have a WINNER!"
// "Error occurred while attempting to save appropriate data.."
// "You cannot use this action quite yet, hasn't been enough time!"
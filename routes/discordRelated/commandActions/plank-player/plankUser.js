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
            const findPlankedUserIndex = users.findIndex(x => x.username === attackingUsername);

            const plankedUser = users[findPlankedUserIndex];
            const authorUser = users[findAuthorIndex];
            const generatedID = uuidv4();

            const newPlankAction = {
                id: generatedID,
                used: new Date(),
                hoursTillNextUse: 168
            }

            const lastDate = _.has(authorUser, "plankActionData") ? new Date(authorUser.plankActionData.used) : null;

            const compareDate = _.has(authorUser, "plankActionData") ? new Date(authorUser.plankActionData.used.setHours(authorUser.plankActionData.used.getHours() + authorUser.plankActionData.hoursTillNextUse)) : null;

            if (authorUser.coins >= 20) {
                if (plankedUser.coins >= 20) {
                    if (_.has(authorUser, "plankActionData") && lastDate !== null) {
                        if (new Date(lastDate) > compareDate) {
                            authorUser.coins -= 20;
                            plankedUser.coins -= 20;

                            authorUser["plankActionData"] = newPlankAction;

                            const savingPromise = new Promise((resolve, reject) => {
                                // save author data..
                                collection.save(authorUser, (error, result) => {
                                    if (error) {
                                        console.log("ERR saving..:", error);
            
                                        res.json({
                                            message: "An error occurred while attempting to update data and save...",
                                            err: error
                                        })
                                    } else {
                                        resolve(authorUser);
                                    }
                                })
                            })

                            savingPromise.then((passedData) => {
                                // save planked user data..
                                collection.save(plankedUser, async (error, result) => {
                                    if (error) {
                                        console.log("ERR saving..:", error);

                                        // reupdate upon failure and refund coins/tokens
                                        const collectionModified = await collection.findOneAndUpdate({ id: authorUser.id }, { $inc: { coins: 20 }});
                                        // return response finally..
                                        if (collectionModified !== null) {
                                            res.json({
                                                message: "An error occurred while attempting to update data and save...",
                                                err: error
                                            })
                                        }
                                    } else {
                                        res.json({
                                            message: "Successfully executed desired action!",
                                            user: authorUser,
                                            username: plankedUser.username,
                                            coins: plankedUser.coins
                                        })
                                    }
                                });
                            })
                        } else {
                            res.json({
                                message: "It has NOT been enough time since your last use of this action/command..",
                                user: authorUser
                            })
                        }
                    } else {
                        authorUser.coins -= 20;
                        plankedUser.coins -= 20;

                        authorUser["plankActionData"] = newPlankAction;

                        const savingPromise = new Promise((resolve, reject) => {
                            // save author data..
                            collection.save(authorUser, (error, result) => {
                                if (error) {
                                    console.log("ERR saving..:", error);
        
                                    res.json({
                                        message: "An error occurred while attempting to update data and save...",
                                        err: error
                                    })
                                } else {
                                    resolve(authorUser);
                                }
                            })
                        })

                        savingPromise.then((passedData) => {
                            // save planked user data..
                            collection.save(plankedUser, async (error, result) => {
                                if (error) {
                                    console.log("ERR saving..:", error);

                                    // reupdate upon failure and refund coins/tokens
                                    const collectionModified = await collection.findOneAndUpdate({ id: authorUser.id }, { $inc: { coins: 20 }});
                                    // return response finally..
                                    if (collectionModified !== null) {
                                        res.json({
                                            message: "An error occurred while attempting to update data and save...",
                                            err: error
                                        })
                                    }
                                } else {
                                    res.json({
                                        message: "Successfully executed desired action!",
                                        user: authorUser,
                                        username: plankedUser.username,
                                        coins: plankedUser.coins
                                    })
                                }
                            });
                        })
                    }
                } else {
                    res.json({
                        message: "Selected user to plank doesn't have enough coins to take!",
                        user: authorUser
                    })
                }
            } else {
                res.json({
                    message: "Author doesn't have enough coins to take this action!",
                    user: authorUser
                })
            }
        }
    })
});

module.exports = router;

// "Author doesn't have enough coins to take this action!"
// "Selected user to plank doesn't have enough coins to take!"
// "Successfully executed desired action!"
// "An error occurred while attempting to update data and save..."
// "It has NOT been enough time since your last use of this action/command.."
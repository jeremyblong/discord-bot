const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");
const _ = require("lodash");


router.post('/', async (req, res) => {

    const { 
        guildID,
        userID
    } = req.body;

    console.log("req.body", req.body);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    const authenticatedSignedInUser = await collection.findOne({ id: userID });

    console.log("authenticatedSignedInUser", authenticatedSignedInUser);

    collection.aggregate({ $sample: { size: 5 } }).toArray((err, users) => {
        if (err) {
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting to update data and save...",
                err
            });
        } else {
            console.log("Successfully located users...:", users);

            const userStolenArray = [];

            if (typeof authenticatedSignedInUser !== "undefined" && authenticatedSignedInUser !== null && _.has(authenticatedSignedInUser, "lastStealData")) {

                const compareDate = new Date(authenticatedSignedInUser.lastStealData.used.setHours(authenticatedSignedInUser.lastStealData.used.getHours() + authenticatedSignedInUser.lastStealData.hoursTillNextUse));

                if (new Date(authenticatedSignedInUser.lastStealData.used) > compareDate) {
                    const customPromise = new Promise((resolve, reject) => {
                        for (let index = 0; index < users.length; index++) {
                            const user = users[index];
                            
                            if (user.coins > 0) {
                                user.coins -= 1;
            
                                userStolenArray.push({
                                    name: `${authenticatedSignedInUser.username} has stolen 1 coin from the user '${user.username}' with the '.steal' command!`,
                                    value: `This 'steal' was facilitated at ${moment(new Date()).format("MM/DD/YYYY hh:mm:ss a")} via the '.steal' command which can be used every 4 (four) hours which target's RANDOM users and takes a coin from them W/O permission..`,
                                    date: new Date(),
                                    inline: false,
                                    amountStolen: 1
                                });
                                // save updated data in loop
                                collection.save(user, (error, result) => {
                                    if (error) {
                                        console.log("error occurred while saving..:", error);
        
                                        resolve(null);
                                    } else {
                                        console.log("successfully stole coins and ran/saved logic changes...!", result);
        
                                        resolve(userStolenArray);
                                    }
                                })
                            } else if ((users.length - 1) === index) {
                                collection.save(user, (error, result) => {
                                    if (error) {
                                        console.log("error occurred while saving..:", error);
        
                                        resolve(null);
                                    } else {
                                        console.log("successfully stole coins and ran/saved logic changes...!", result);
        
                                        resolve(userStolenArray);
                                    }
                                })
                            } else {
                                console.log("user is poor and has no coins, do nothing!");
                            }
                        }
                    })
        
                    customPromise.then((arr) => {
        
                        const generatedID = uuidv4();
        
                        authenticatedSignedInUser["coins"] += 5;
                        authenticatedSignedInUser["lastStealData"] = {
                            used: new Date(),
                            hoursTillNextUse: 4,
                            id: generatedID
                        }
                        
                        collection.save(authenticatedSignedInUser, (error, result) => {
                            if (error) {
                                console.log("error occurred while saving..:", error);
                            } else {
                                console.log("Final success!", result);
        
                                if (arr !== null) {
                                    res.json({
                                        message: "Successfully executed desired action!",
                                        users,
                                        user: authenticatedSignedInUser,
                                        userStolenArray: arr
                                    })
                                } else {
                                    res.json({
                                        message: "An error occurred while attempting to save changes and update related information..",
                                        user: authenticatedSignedInUser
                                    })
                                }
                            }
                        })
                    })
                } else {
                    res.json({
                        message: "You're not able/allowed to 'steal' again yet... Please wait the full four hours before attempting to run this command again..",
                        user: authenticatedSignedInUser
                    })
                }
            } else {
                const customPromise = new Promise((resolve, reject) => {
                    for (let index = 0; index < users.length; index++) {
                        const user = users[index];
                        
                        if (user.coins > 0) {
                            user.coins -= 1;
        
                            userStolenArray.push({
                                name: `${authenticatedSignedInUser.username} has stolen 1 coin from the user '${user.username}' with the '.steal' command!`,
                                value: `This 'steal' was facilitated at ${moment(new Date()).format("MM/DD/YYYY hh:mm:ss a")} via the '.steal' command which can be used every 4 (four) hours which target's RANDOM users and takes a coin from them W/O permission..`,
                                date: new Date(),
                                inline: false,
                                amountStolen: 1
                            });
                            // save updated data in loop
                            collection.save(user, (error, result) => {
                                if (error) {
                                    console.log("error occurred while saving..:", error);
    
                                    resolve(null);
                                } else {
                                    console.log("successfully stole coins and ran/saved logic changes...!", result);
    
                                    resolve(userStolenArray);
                                }
                            })
                        } else if ((users.length - 1) === index) {
                            collection.save(user, (error, result) => {
                                if (error) {
                                    console.log("error occurred while saving..:", error);
    
                                    resolve(null);
                                } else {
                                    console.log("successfully stole coins and ran/saved logic changes...!", result);
    
                                    resolve(userStolenArray);
                                }
                            })
                        } else {
                            console.log("user is poor and has no coins, do nothing!");
                        }
                    }
                })
    
                customPromise.then((arr) => {
    
                    const generatedID = uuidv4();
    
                    authenticatedSignedInUser["coins"] += 5;
                    authenticatedSignedInUser["lastStealData"] = {
                        used: new Date(),
                        hoursTillNextUse: 4,
                        id: generatedID
                    }
                    
                    collection.save(authenticatedSignedInUser, (error, result) => {
                        if (error) {
                            console.log("error occurred while saving..:", error);
                        } else {
                            console.log("Final success!", result);
    
                            if (arr !== null) {
                                res.json({
                                    message: "Successfully executed desired action!",
                                    users,
                                    user: authenticatedSignedInUser,
                                    userStolenArray: arr
                                })
                            } else {
                                res.json({
                                    message: "An error occurred while attempting to save changes and update related information..",
                                    user: authenticatedSignedInUser
                                })
                            }
                        }
                    })
                })
            }
        }
    })
});

module.exports = router;
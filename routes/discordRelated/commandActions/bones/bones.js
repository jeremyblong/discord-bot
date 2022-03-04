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

    collection.findOne({ id: userID }).then((user) => {
        if (!user) {
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting to update data and save..."
            });
        } else {
            console.log("Successfully located user...:", user);

            if (_.has(user, "bonesActionData")) {
                const compareDate = new Date(user.bonesActionData.used.setHours(user.bonesActionData.used.getHours() + user.bonesActionData.hoursTillNextUse));
                
                if (new Date(user.bonesActionData.used) > compareDate) {
                    if (user.coins >= 10) {
    
                        const oddOrEven = Math.floor(Math.random() * (2 - 1 + 1) + 1);
        
                        console.log("oddOrEven", oddOrEven);
        
                        if (oddOrEven % 2 === 1) {
                            // odd - WINNER!
                            console.log("odd - WINNER!");
        
                            user.coins += 10;
        
                            user["bonesActionData"] = {
                                id: uuidv4(),
                                used: new Date(),
                                hoursTillNextUse: 6
                            }
        
                            collection.save(user, (err, result) => {
                                if (err) {
                                    console.log("error occurred while saving..:", err);
                                } else {
                                    console.log("successfully saved and updated!");
        
                                    res.json({
                                        message: "We have a WINNER!",
                                        user
                                    })
                                }
                            })
                        } else {
                            // even - LOSER/LOST!
                            console.log("even - LOSER/LOST!");
        
                            user.coins -= 10;
        
                            user["bonesActionData"] = {
                                id: uuidv4(),
                                used: new Date(),
                                hoursTillNextUse: 6
                            }
        
                            collection.save(user, (err, result) => {
                                if (err) {
                                    console.log("error occurred while saving..:", err);
                                } else {
                                    console.log("successfully saved and updated!");
        
                                    res.json({
                                        message: "Unfortunately you've NOT a winner..",
                                        user
                                    })
                                }
                            })
                        }
                    } else {
                        res.json({
                            message: "You do NOT have enough coins to .bones at the moment..",
                            user
                        })
                    }
                } else {
                    res.json({
                        message: "It hasn't been long enough since your last use of this command!",
                        user
                    })
                }
            } else {
                if (user.coins >= 10) {
    
                    const oddOrEven = Math.floor(Math.random() * (2 - 1 + 1) + 1);
    
                    console.log("oddOrEven", oddOrEven);
    
                    if (oddOrEven % 2 === 1) {
                        // odd - WINNER!
                        console.log("odd - WINNER!");
    
                        user.coins += 10;
    
                        user["bonesActionData"] = {
                            id: uuidv4(),
                            used: new Date(),
                            hoursTillNextUse: 6
                        }
    
                        collection.save(user, (err, result) => {
                            if (err) {
                                console.log("error occurred while saving..:", err);
                            } else {
                                console.log("successfully saved and updated!");
    
                                res.json({
                                    message: "We have a WINNER!",
                                    user
                                })
                            }
                        })
                    } else {
                        // even - LOSER/LOST!
                        console.log("even - LOSER/LOST!");
    
                        user.coins -= 10;
    
                        user["bonesActionData"] = {
                            id: uuidv4(),
                            used: new Date(),
                            hoursTillNextUse: 6
                        }
    
                        collection.save(user, (err, result) => {
                            if (err) {
                                console.log("error occurred while saving..:", err);
                            } else {
                                console.log("successfully saved and updated!");
    
                                res.json({
                                    message: "Unfortunately you've NOT a winner..",
                                    user
                                })
                            }
                        })
                    }
                } else {
                    res.json({
                        message: "You do NOT have enough coins to .bones at the moment..",
                        user
                    })
                }
            }
        }
    })
});

module.exports = router;
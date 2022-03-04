const express = require('express');
const router = express.Router();
const { Connection } = require("../../../../mongoUtil.js");
const _ = require("lodash");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');


// SNIPE PLAYER LOGIC
router.post('/', async (req, res) => {

    const { 
        guildID,
        userID,
        usernameToSnipe,
        authorUsername,
        headshot
    } = req.body;

    console.log("req.body", req.body);

    const collection = Connection.db.db("myFirstDatabase").collection(guildID);

    collection.find({ username: { $in: [ authorUsername, usernameToSnipe ] }}).toArray(async (err, users) => {
        if (err) { 
            console.log("Error occurred while attempting to fetch related user...");

            res.json({
                message: "An error occurred while attempting find & update related user's..",
                err
            });
        } else {

            console.log("Successfully located users...:", users);

            if (typeof users !== "undefined" && users.length === 1) {
                // did NOT enter proper username
                res.json({
                    message: "Did NOT enter a proper username...cancelling.",
                    users
                })
            } else {
                const findAuthorIndex = users.findIndex(x => x.username === authorUsername);
                const findSnipedUserIndex = users.findIndex(x => x.username === usernameToSnipe);

                const snipedUser = users[findSnipedUserIndex];
                const authorUser = users[findAuthorIndex];

                const generatedBetween = Math.floor(Math.random() * (4 - 1 + 1) + 1);

                const snipeAction = {
                    id: uuidv4(),
                    used: new Date(),
                    hoursTillNextUse: 8
                };

                if (_.has(authorUser, "snipeActionData")) {
                    const previouslyUsed = new Date(authorUser.snipeActionData.used);
                    
                    const compareDate = new Date(previouslyUsed.setHours(previouslyUsed.getHours() + authorUser.snipeActionData.hoursTillNextUse));
                
                    if (new Date(authorUser.snipeActionData.used) > compareDate) {
                        if (_.has(snipedUser, "resting") && _.has(snipedUser, "resting")) {
                            if (snipedUser.resting === false && snipedUser.frozen === false) {

                                if (headshot === "yes") {
                                    const generatedNumber = Math.floor(Math.random() * (100 - 1 + 1) + 1)
                                    // reduce miss by 5% as user added 'bonus snipe'
                                    if (generatedNumber <= 20) {
                                        console.log("miss!", generatedNumber);

                                        authorUser.coins -= 5;
            
                                        authorUser["snipeActionData"] = snipeAction;
                                        
                                        collection.save(authorUser, (error, result) => {
                                            if (error) {
                                                console.log("error has occurred while attempting to save..:", error);
        
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: error
                                                })
                                            } else {
                                                console.log("Successfully saved data - return response!...:", result);
                
                                                res.json({
                                                    message: "Successfully executed desired action HOWEVER missed user's shot!",
                                                    user: authorUser
                                                })
                                            }
                                        })
                                    } else if (21 <= generatedNumber && generatedNumber <= 50) {
                                        // headshot landed - 30% chance VS normal 25%
                                        console.log("headshot!", generatedNumber);

                                        if (snipedUser.coins >= 10) {
                                            // user has enough coins - continue the attack..
        
                                            // manage sniped user coin deduction first..
                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -10 }});
        
                                            if (savedOrNotSniped === null) {
                                                // failure to save and find and update user..
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: null
                                                })
                                            } else {
                                                // saved user data, now edit author data..
                                                collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 10 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                    if (errorEditing) {
                                                        console.log("errorEditing", errorEditing);
        
                                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 10 }});
        
                                                        if (savedOrNotSniped) {
                                                            res.json({
                                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                                err: errorEditing
                                                            })
                                                        }
                                                    } else {
                                                        // successfully MODIFIED BOTH users..
                                                        console.log("resultEditing", resultEditing);
        
                                                        // return final response..
                                                        res.json({
                                                            message: "Successfully executed desired action & landed your shot!",
                                                            user: resultEditing.value,
                                                            headshot: true
                                                        })
                                                    }
                                                });
                                            }
                                        } else {
                                            // user does NOT have enough coins..
                                            res.json({
                                                message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                user: authorUser
                                            })
                                        }
                                    } else if (51 <= generatedNumber && generatedNumber <= 100) {
                                        // bodyshot landed 50% liklihood activated.
                                        console.log("bodyshot!", generatedNumber);

                                        if (snipedUser.coins <= 5) {
                                            // person does NOT have enough coins to attack!
                                            res.json({
                                                message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                user: authorUser
                                            })
                                        } else {
                                            // person has MORE than enough coins!
        
                                            // manage sniped user coin deduction first..
                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -5 }});
        
                                            if (savedOrNotSniped === null) {
                                                // failure to save and find and update user..
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: null
                                                })
                                            } else { 
                                                // saved user data, now edit author data..
                                                collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 5 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                    if (errorEditing) {
                                                        console.log("errorEditing", errorEditing);
        
                                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 5 }});
        
                                                        if (savedOrNotSniped) {
                                                            res.json({
                                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                                err: errorEditing
                                                            })
                                                        }
                                                    } else {
                                                        // successfully MODIFIED BOTH users..
                                                        console.log("resultEditing", resultEditing);
        
                                                        // return final response..
                                                        res.json({
                                                            message: "Successfully executed desired action & landed your shot!",
                                                            user: resultEditing.value
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    }
                                } else {
                                    switch (generatedBetween) {
                                        case 1:
                                            // (MISS - 25% chance) Steal 0 coins - Lose 5 coins
                                            authorUser.coins -= 5;
            
                                            authorUser["snipeActionData"] = snipeAction;
                                            
                                            collection.save(authorUser, (error, result) => {
                                                if (error) {
                                                    console.log("error has occurred while attempting to save..:", error);
            
                                                    res.json({
                                                        message: "An error has occurred while attempting to save at some point altered data..",
                                                        err: error
                                                    })
                                                } else {
                                                    console.log("Successfully saved data - return response!...:", result);
                    
                                                    res.json({
                                                        message: "Successfully executed desired action HOWEVER missed user's shot!",
                                                        user: authorUser
                                                    })
                                                }
                                            })
                                            break;
                                        case 2:
                                        case 3:
                                            // (BODYSHOT- 50% chance) Steal 5 coins from a specific person (If @player doesn't have 5 coins MISS)
                                            if (snipedUser.coins <= 5) {
                                                // person does NOT have enough coins to attack!
                                                res.json({
                                                    message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                    user: authorUser
                                                })
                                            } else {
                                                // person has MORE than enough coins!
            
                                                // manage sniped user coin deduction first..
                                                const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -5 }});
            
                                                if (savedOrNotSniped === null) {
                                                    // failure to save and find and update user..
                                                    res.json({
                                                        message: "An error has occurred while attempting to save at some point altered data..",
                                                        err: null
                                                    })
                                                } else { 
                                                    // saved user data, now edit author data..
                                                    collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 5 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                        if (errorEditing) {
                                                            console.log("errorEditing", errorEditing);
            
                                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 5 }});
            
                                                            if (savedOrNotSniped) {
                                                                res.json({
                                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                                    err: errorEditing
                                                                })
                                                            }
                                                        } else {
                                                            // successfully MODIFIED BOTH users..
                                                            console.log("resultEditing", resultEditing);
            
                                                            // return final response..
                                                            res.json({
                                                                message: "Successfully executed desired action & landed your shot!",
                                                                user: resultEditing.value
                                                            })
                                                        }
                                                    });
                                                }
                                            }
                                            break;
                                        case 4:
                                            // (HEADSHOT - 25% chance) Steal 10 coins from a specific person (If @player doesn't have 10 coins MISS);
                                            
                                            if (snipedUser.coins >= 10) {
                                                // user has enough coins - continue the attack..
            
                                                // manage sniped user coin deduction first..
                                                const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -10 }});
            
                                                if (savedOrNotSniped === null) {
                                                    // failure to save and find and update user..
                                                    res.json({
                                                        message: "An error has occurred while attempting to save at some point altered data..",
                                                        err: null
                                                    })
                                                } else {
                                                    // saved user data, now edit author data..
                                                    collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 10 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                        if (errorEditing) {
                                                            console.log("errorEditing", errorEditing);
            
                                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 10 }});
            
                                                            if (savedOrNotSniped) {
                                                                res.json({
                                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                                    err: errorEditing
                                                                })
                                                            }
                                                        } else {
                                                            // successfully MODIFIED BOTH users..
                                                            console.log("resultEditing", resultEditing);
            
                                                            // return final response..
                                                            res.json({
                                                                message: "Successfully executed desired action & landed your shot!",
                                                                user: resultEditing.value,
                                                                headshot: true
                                                            })
                                                        }
                                                    });
                                                }
                                            } else {
                                                // user does NOT have enough coins..
                                                res.json({
                                                    message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                    user: authorUser
                                                })
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            } else {
        
                                authorUser["snipeActionData"] = snipeAction;
                                        
                                collection.save(authorUser, (error, result) => {
                                    if (error) {
                                        console.log("error has occurred while attempting to save..:", error);
        
                                        res.json({
                                            message: "An error has occurred while attempting to save at some point altered data..",
                                            err: error
                                        })
                                    } else {
                                        console.log("Successfully saved data - return response!...:", result);
        
                                        res.json({
                                            message: "User is frozen/sleeping - wasted shot.",
                                            user: authorUser
                                        })
                                    }
                                })
                            }
                        } else {
                            authorUser["snipeActionData"] = snipeAction;
                                        
                            collection.save(authorUser, (error, result) => {
                                if (error) {
                                    console.log("error has occurred while attempting to save..:", error);
        
                                    res.json({
                                        message: "An error has occurred while attempting to save at some point altered data..",
                                        err: error
                                    })
                                } else {
                                    console.log("Successfully saved data - return response!...:", result);
        
                                    res.json({
                                        message: "User is frozen/sleeping - wasted shot.",
                                        user: authorUser
                                    })
                                }
                            })
                        }
                    } else {
                        res.json({
                            message: "You haven't waited long enough to take this action again...",
                            user: authorUser
                        })
                    }
                } else {
                    if (_.has(snipedUser, "resting") && _.has(snipedUser, "resting")) {
                        if (snipedUser.resting === false && snipedUser.frozen === false) {
                            if (headshot === "yes") {
                                const generatedNumber = Math.floor(Math.random() * (100 - 1 + 1) + 1)
                                // reduce miss by 5% as user added 'bonus snipe'
                                if (generatedNumber <= 20) {
                                    console.log("miss!", generatedNumber);

                                    authorUser.coins -= 5;
        
                                    authorUser["snipeActionData"] = snipeAction;
                                    
                                    collection.save(authorUser, (error, result) => {
                                        if (error) {
                                            console.log("error has occurred while attempting to save..:", error);
    
                                            res.json({
                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                err: error
                                            })
                                        } else {
                                            console.log("Successfully saved data - return response!...:", result);
            
                                            res.json({
                                                message: "Successfully executed desired action HOWEVER missed user's shot!",
                                                user: authorUser
                                            })
                                        }
                                    })
                                } else if (21 <= generatedNumber && generatedNumber <= 50) {
                                    // headshot landed - 30% chance VS normal 25%
                                    console.log("headshot!", generatedNumber);

                                    if (snipedUser.coins >= 10) {
                                        // user has enough coins - continue the attack..
    
                                        // manage sniped user coin deduction first..
                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -10 }});
    
                                        if (savedOrNotSniped === null) {
                                            // failure to save and find and update user..
                                            res.json({
                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                err: null
                                            })
                                        } else {
                                            // saved user data, now edit author data..
                                            collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 10 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                if (errorEditing) {
                                                    console.log("errorEditing", errorEditing);
    
                                                    const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 10 }});
    
                                                    if (savedOrNotSniped) {
                                                        res.json({
                                                            message: "An error has occurred while attempting to save at some point altered data..",
                                                            err: errorEditing
                                                        })
                                                    }
                                                } else {
                                                    // successfully MODIFIED BOTH users..
                                                    console.log("resultEditing", resultEditing);
    
                                                    // return final response..
                                                    res.json({
                                                        message: "Successfully executed desired action & landed your shot!",
                                                        user: resultEditing.value,
                                                        headshot: true
                                                    })
                                                }
                                            });
                                        }
                                    } else {
                                        // user does NOT have enough coins..
                                        res.json({
                                            message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                            user: authorUser
                                        })
                                    }
                                } else if (51 <= generatedNumber && generatedNumber <= 100) {
                                    // bodyshot landed 50% liklihood activated.
                                    console.log("bodyshot!", generatedNumber);

                                    if (snipedUser.coins <= 5) {
                                        // person does NOT have enough coins to attack!
                                        res.json({
                                            message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                            user: authorUser
                                        })
                                    } else {
                                        // person has MORE than enough coins!
    
                                        // manage sniped user coin deduction first..
                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -5 }});
    
                                        if (savedOrNotSniped === null) {
                                            // failure to save and find and update user..
                                            res.json({
                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                err: null
                                            })
                                        } else { 
                                            // saved user data, now edit author data..
                                            collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 5 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                if (errorEditing) {
                                                    console.log("errorEditing", errorEditing);
    
                                                    const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 5 }});
    
                                                    if (savedOrNotSniped) {
                                                        res.json({
                                                            message: "An error has occurred while attempting to save at some point altered data..",
                                                            err: errorEditing
                                                        })
                                                    }
                                                } else {
                                                    // successfully MODIFIED BOTH users..
                                                    console.log("resultEditing", resultEditing);
    
                                                    // return final response..
                                                    res.json({
                                                        message: "Successfully executed desired action & landed your shot!",
                                                        user: resultEditing.value
                                                    })
                                                }
                                            });
                                        }
                                    }
                                }
                            } else {
                                switch (generatedBetween) {
                                    case 1:
                                        // (MISS - 25% chance) Steal 0 coins - Lose 5 coins
                                        authorUser.coins -= 5;
        
                                        authorUser["snipeActionData"] = snipeAction;
                                        
                                        collection.save(authorUser, (error, result) => {
                                            if (error) {
                                                console.log("error has occurred while attempting to save..:", error);
        
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: error
                                                })
                                            } else {
                                                console.log("Successfully saved data - return response!...:", result);
                
                                                res.json({
                                                    message: "Successfully executed desired action HOWEVER missed user's shot!",
                                                    user: authorUser
                                                })
                                            }
                                        })
                                        break;
                                    case 2:
                                    case 3:
                                        // (BODYSHOT- 50% chance) Steal 5 coins from a specific person (If @player doesn't have 5 coins MISS)
                                        if (snipedUser.coins <= 5) {
                                            // person does NOT have enough coins to attack!
                                            res.json({
                                                message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                user: authorUser
                                            })
                                        } else {
                                            // person has MORE than enough coins!
        
                                            // manage sniped user coin deduction first..
                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -5 }});
        
                                            if (savedOrNotSniped === null) {
                                                // failure to save and find and update user..
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: null
                                                })
                                            } else { 
                                                // saved user data, now edit author data..
                                                collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 5 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                    if (errorEditing) {
                                                        console.log("errorEditing", errorEditing);
        
                                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 5 }});
        
                                                        if (savedOrNotSniped) {
                                                            res.json({
                                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                                err: errorEditing
                                                            })
                                                        }
                                                    } else {
                                                        // successfully MODIFIED BOTH users..
                                                        console.log("resultEditing", resultEditing);
        
                                                        // return final response..
                                                        res.json({
                                                            message: "Successfully executed desired action & landed your shot!",
                                                            user: resultEditing.value
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case 4:
                                        // (HEADSHOT - 25% chance) Steal 10 coins from a specific person (If @player doesn't have 10 coins MISS);
                                        
                                        if (snipedUser.coins >= 10) {
                                            // user has enough coins - continue the attack..
        
                                            // manage sniped user coin deduction first..
                                            const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: -10 }});
        
                                            if (savedOrNotSniped === null) {
                                                // failure to save and find and update user..
                                                res.json({
                                                    message: "An error has occurred while attempting to save at some point altered data..",
                                                    err: null
                                                })
                                            } else {
                                                // saved user data, now edit author data..
                                                collection.findOneAndUpdate({ id: authorUser.id }, { $set: { snipeActionData: snipeAction }, $inc: { coins: 10 }}, { returnOriginal: false }, async (errorEditing, resultEditing) => {
                                                    if (errorEditing) {
                                                        console.log("errorEditing", errorEditing);
        
                                                        const savedOrNotSniped = await collection.findOneAndUpdate({ id: snipedUser.id }, { $inc: { coins: 10 }});
        
                                                        if (savedOrNotSniped) {
                                                            res.json({
                                                                message: "An error has occurred while attempting to save at some point altered data..",
                                                                err: errorEditing
                                                            })
                                                        }
                                                    } else {
                                                        // successfully MODIFIED BOTH users..
                                                        console.log("resultEditing", resultEditing);
        
                                                        // return final response..
                                                        res.json({
                                                            message: "Successfully executed desired action & landed your shot!",
                                                            user: resultEditing.value,
                                                            headshot: true
                                                        })
                                                    }
                                                });
                                            }
                                        } else {
                                            // user does NOT have enough coins..
                                            res.json({
                                                message: "Shot connected HOWEVER they didn't have enough coins therefore you've missed your shot.",
                                                user: authorUser
                                            })
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        } else {
    
                            authorUser["snipeActionData"] = snipeAction;
                                    
                            collection.save(authorUser, (error, result) => {
                                if (error) {
                                    console.log("error has occurred while attempting to save..:", error);
    
                                    res.json({
                                        message: "An error has occurred while attempting to save at some point altered data..",
                                        err: error
                                    })
                                } else {
                                    console.log("Successfully saved data - return response!...:", result);
    
                                    res.json({
                                        message: "User is frozen/sleeping - wasted shot.",
                                        user: authorUser
                                    })
                                }
                            })
                        }
                    } else {
                        authorUser["snipeActionData"] = snipeAction;
                                    
                        collection.save(authorUser, (error, result) => {
                            if (error) {
                                console.log("error has occurred while attempting to save..:", error);
    
                                res.json({
                                    message: "An error has occurred while attempting to save at some point altered data..",
                                    err: error
                                })
                            } else {
                                console.log("Successfully saved data - return response!...:", result);
    
                                res.json({
                                    message: "User is frozen/sleeping - wasted shot.",
                                    user: authorUser
                                })
                            }
                        })
                    }
                }
            }
        }
    })
});

module.exports = router;
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema =  new Schema({
    id: {
        type: String
    },
    bot: {
        type: Boolean
    },
    system: {
        type: Boolean
    },
    guildID: {
        type: String
    },
    flags: {
        type: Object
    },
    username: {
        type: String
    },
    discriminator: {
        type: String
    },
    avatar: {
        type: String
    },
    banner: {
        type: String
    },
    accentColor: {
        type: String
    }
});


const dynamicSchemaSaveNewGuildUser = (guildID) => {
    
    console.log("GUILDDDDD", guildID);

    const addition = mongoose.model(guildID, UserSchema);

    return addition;
}
module.exports = dynamicSchemaSaveNewGuildUser;
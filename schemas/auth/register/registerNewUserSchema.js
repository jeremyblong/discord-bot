const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema =  new Schema({
    id: {
        type: String
    },
    username: {
        type: String
    },
    descriminator: {
        type: String
    },
    avatar: {
        type: String
    },
    defaultAvatarURL: {
        type: String
    },
    avatarURL: {
        type: String
    },
    system: {
        type: Boolean
    },
    discriminator: {
        type: Number
    },
    bot: {
        type: Boolean
    },
    banner: {
        type: String
    },
    uniqueId: {
        type: String
    },
    locale: {
        type: String
    },
    verified: {
        type: Boolean
    },
    email: {
        type: String
    },
    mfa_enabled: {
        type: Boolean
    },
    coins: {
        type: Number
    }
});

module.exports = User = mongoose.model("admin", UserSchema);
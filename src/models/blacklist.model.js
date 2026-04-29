const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token : {
        type : String,
        required : [true , "Token is required to blacklist a token"],
        index : true,
        unique : true
    },
    blacklistedAt : {
        type : Date,
        default : Date.now,
        immutable : true
    }},{
    timestamps : true
    }
)

tokenBlacklistSchema.index({ createdAt : 1 }, 
    { expireAfterSeconds : 60 * 60 * 24 * 3}) // 3 days 


const tokenBlacklistModel = mongoose.model("tokenBlacklist",tokenBlacklistSchema)

module.exports = tokenBlacklistModel
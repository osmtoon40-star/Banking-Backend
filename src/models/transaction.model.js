const mongoose = require('mongoose');



const transactionSchema = new mongoose.Schema({
    
    fromAccount :{
        type: mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : [true , "From account is required to create a transaction"]
    },
    toAccount :{
        type: mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : [true , "To account is required to create a transaction"]
    },
    amount :{
        type : Number,
        required : true,
        min : [0.01 , "Amount must be greater than 0"]
    },
    idempotencyKey :{
        type : String,
        required : [true , "Idempotency key is required to create a transaction"],
        index : true,
        unique : true
    },
    status :{
        type : String,
        enum : {
            values : ["PENDING", "COMPLETED", "FAILED","REVERSED"],
            message : "Status must be either PENDING, COMPLETED or FAILED",
            default : "PENDING"
        }},
}, {
    timestamps : true
})



const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel
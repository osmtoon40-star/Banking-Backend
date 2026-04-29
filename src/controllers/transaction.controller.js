const transactionModel = require("../models/transaction.model")
const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const mongoose = require("mongoose")
const emailService = require("../services/email.service")



/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. check acocount status
 * 4. Derive sender balance from ledger
 * 5. Create transaction with PENDING status
 * 6. Create ledger entry for sender with DEBIT type
 * 7. Create ledger entry for receiver with CREDIT type
 * 8. Update transaction status to COMPLETED
 * 9. Commit mongoDB session
 * 10. send email notification to sender and receiver
 */


async function createTransaction(req, res) {

    const {fromAccount, toAccount, amount, idempotencyKey} = req.body

    // Step 1: Validate request

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields",
            status: "failed"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id : fromAccount,
        user: req.user._id // Ensure the account belongs to the current user
    })

    const toUserAccount = await accountModel.findOne({
        _id : toAccount
    })

    if(!fromUserAccount || !toUserAccount)
    {
        return res.status(404).json({
            message : "One or both accounts not found",
            
        })
    }

    // Step 2: Validate idempotency key
    
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey
    })
    if(existingTransaction){
        if(existingTransaction.status == "COMPLETED")
        {
            return res.status(200).json({
                message : "Transaction already completed",
                status : "success",
                data : existingTransaction
            })
        }


        if(existingTransaction.status == "PENDING")
        {
            return res.status(200).json({
                message : "Transaction already exists and is pending",
                
            })
        }

        if(existingTransaction.status == "FAILED")
        {
            return res.status(200).json({
                message : "Transaction already exists and has failed",
                status : "failed",
                data : existingTransaction
            })
        }


        if(existingTransaction.status == "REVERSED")
        {
            return res.status(200).json({
                message : "Transaction already exists and has been reversed",
                status : "failed",
                data : existingTransaction
            })
        }

    }

        // Step 3: check account status
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE")
    {
        return res.status(400).json({
            message : "Both accounts must be active to perform a transaction    ",
            status : "failed"
        })
    }

    // Step 4: Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance()
    
    if(balance < amount)
    {
        return res.status(400).json({
            message : "Insufficient balance in sender's account",
            status : "failed"
        })
    }
    let transaction
    try{
    // Step 5: Create transaction with PENDING status
    const session = await mongoose.startSession()
    session.startTransaction()

    transaction = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status : "PENDING"
    }], {session})
    
    transaction = transaction[0] // Get the actual transaction object

    // Step 6: Create ledger entry for sender with DEBIT type
    await ledgerModel.create([{
        account : fromAccount,
        amount,
        transaction : transaction._id,
        type : "DEBIT",
        
    }], {session})

    // Step 7: Create ledger entry for receiver with CREDIT type
    await ledgerModel.create([{
        account : toAccount,
        amount,
        transaction : transaction._id,
        type : "CREDIT"
    }], {session})

    // Step 8: Update transaction status to COMPLETED
    await transactionModel.findOneAndUpdate(
        {_id : transaction._id},
        {status : "COMPLETED"},
        {session}
    )

    await session.commitTransaction()
    session.endSession()
    }catch(error){
        console.error('Transaction error:', error)
        return res.status(400).json({
            message : "Transaction failed due to an error, please retry after sometime",
            error: error.message
        })
    }

    // Step 10: send email notification to sender and receiver

    await emailService.sendTransactionEmail(req.user.email,req.user.name , amount, toUserAccount._id)

    return res.status(201).json({
        message : "Transaction completed successfully",
        status : "success",
        data : transaction
    })
    
}


async function createInitialFundsTransaction(req,res){
    
    const{toAccount , amount , idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey)
    {
        return res.status(400).json({
            message : "toAccount, amount and idempotencyKey are required",
            status : "failed"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id : toAccount
    })

    if(!toUserAccount)
    {
        return res.status(404).json({
            message : "Receiver account not found",
            status : "failed"
        })
    }

    let fromUserAccount = await accountModel.findOne({
        systemUser : true
    })

    if(!fromUserAccount)
    {
        // Create a system account if it doesn't exist
        fromUserAccount = await accountModel.create({
            systemUser : true,
            currency : "INR"
        })
    }

    
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create([{
        fromAccount : fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status : "COMPLETED"
    }], {session})

    const debitLedgerEntry = await ledgerModel.create([{
        account : fromUserAccount._id,
        amount,
        transaction : transaction[0]._id,
        type : "DEBIT"
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account : toAccount,
        amount,
        transaction : transaction[0]._id,
        type : "CREDIT"
    }], {session})

    await session.commitTransaction()
    session.endSession()

    await emailService.sendTransactionEmail(req.user.email,req.user.name , amount, toUserAccount._id)

    return res.status(201).json({
        message : "Initial funds transaction completed successfully",
        status : "success",
        data : transaction
    })
    
}


async function getUserAccountsController(req,res){

    const accounts = await accountModel.find({
        user : req.user._id
    })

    return res.status(200).json({
        
        data : accounts
    })


}






module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getUserAccountsController 
}
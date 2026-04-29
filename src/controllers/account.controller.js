const accountModel = require("../models/account.model")
const { getUserAccountsController } = require("./transaction.controller")



async function createAccountController(req, res) {

    try {
        const user = req.user

        const account = await accountModel.create({ 
            user: user._id 
        })

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: account
        })
    } catch (error) {
        console.error("Error creating account:", error)
        res.status(500).json({
            success: false,
            message: "Failed to create account",
            error: error.message
        })
    }
}

async function getUserAccountsController(req, res) {

    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    })
}



async function getAccountBalanceController(req, res) {

    const { accountId } = req.params

    const account = await accountModel.findOne({
        _id : accountId,
        user : req.user._id
    })

    if(!account)
    {
        return res.status(404).json({
            message : "Account not found",
            
        })
    }

    const balance = await account.getBalance()

    return res.status(200).json({
        message : "Account balance retrieved successfully",
        status : "success",
        data : {
            accountId,
            balance
        }
    })


}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
}


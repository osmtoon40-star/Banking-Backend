const {Router} = require('express');
const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = Router()





/**
 * - POST /api/transaction/
 * - Create a new transaction
 */

router.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)



/**
 * - POST /api/transaction/system/initial-funds
 * - Create initial funds transaction from system account to user account
 */

router.post("/system/initial-funds", authMiddleware.authMiddleware, transactionController.createInitialFundsTransaction)

module.exports = router
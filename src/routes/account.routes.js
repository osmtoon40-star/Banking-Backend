const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const createAccountController  = require("../controllers/account.controller")


const router = express.Router()


/**
 * - POST /api/accounts
 * - Create a new account for the authenticated user.
 * - Protected route, requires authentication.
 */

router.post("/", authMiddleware.authMiddleware, createAccountController.createAccountController)



/**
 * - GET /api/accounts
 * - Retrieve all accounts for the authenticated user.
 * - Protected route, requires authentication.
 */
router.get("/", authMiddleware.authMiddleware, createAccountController.getUserAccountsController)


/**
 * - GET /api/accounts/balance/:accountId
 * - Retrieve the balance of a specific account for the authenticated user.
 * - Protected route, requires authentication.
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, createAccountController.getAccountBalanceController)



module.exports = router

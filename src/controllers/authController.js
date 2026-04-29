const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")


/**
 * - user register controller
 * - POST /api/auth/register
 */


async function userRegisterController(req,res){

    const {email,password,name} = req.body

    const isAlreadyRegistered = await userModel.findOne({
        email:email
    })

    if(isAlreadyRegistered)
    {
        return res.status(422).json({
            message : "User already exists with email",
            status:"failed"
        })
    }

    const user = await userModel.create({
        email,password,name
    })

    

    const token = jwt.sign({
        user:user._id
    },process.env.JWT_SECRET,{
        expiresIn :"3d"
    })

    res.cookie("token",token)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email,user.name)


}


/**
 * - user login controller
 * - POST /api/auth/login
 */
async function userLoginController(req,res){
     const{email,password} = req.body

     const user = await userModel.findOne({email}).select("+password")

     if(!user)
     {
        return res.status(401).json({
            message:"Email or password is INVALID"
        })
     }

     const isValidPassword = await user.comparePassword(password)

     if(!isValidPassword)
     {
        return res.status(401).json({
            message:"Password is INVALID"
        })
     }

    const token = jwt.sign({
        user:user._id
    },process.env.JWT_SECRET,{
        expiresIn :"3d"
    })

    res.cookie("token",token)

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}

async function userLogoutController(req,res){
    
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token)
    {
        return res.status(400).json({
            message : "Token not found",
            status : "failed"
        })
    }

    res.clearCookie("token")

    const tokenBlacklistModel = require("../models/blacklist.model")

    await tokenBlacklistModel.create({
        token
    })

    return res.status(200).json({
        message : "User logged out successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}

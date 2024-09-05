
import { User } from "../models/user.model.js";
import  jwt  from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { mailer } from "../utils/mailer.utils.js";
import crypto from "crypto"

//generate access and refresh token
const generateAccessRefreshToken=async(userId)=>{
    const LoggedUser=await User.findById(userId)
    const accessToken=await LoggedUser.generateAccessToken()
    const refreshToken=await LoggedUser.generateRefreshToken()
    LoggedUser.refreshToken=refreshToken
await LoggedUser.save()
return {accessToken,refreshToken}
}


//User Register operation
const registerUser= async(req,res)=>{
    const{email, fullName, password, confirmPassword}=req.body;
    
    if((!email||!fullName||!password)===""){
        return res.status(400).json("Field cant be empty")
    }
    const checkEmail=await User.findOne({email:email})
    if(checkEmail){
        console.log(checkEmail)
        return res.status(400).json("Email already exists")
    }
    if(password.length<8){
        return res.status(400).json("Password should be of minimum 8 characters")
    }
    if(password!=confirmPassword){
        return res.status(400).json("Passwords doesnt match")
    }
    const userData=await User.create({
        email:email.toLowerCase(),
        fullName,
        password
    })
    if(!userData){
        return res.status(400).json("Something went wrong while sending data to database")
    }
   return res.status(201).json("User created succesfully")
    
}



// login function

const userLogin= async(req,res)=>{
    const {email, password}=req.body
    const isUserRegistered= await User.findOne({email:email})
    if(!isUserRegistered){
        return res.status(401).json("User is not registered")
    }
    const checkPassword= await isUserRegistered.comparePassword(password)
    if(!checkPassword){
        return res.status(401).json("Wrong password")
    }
    const{accessToken,refreshToken}=await generateAccessRefreshToken(isUserRegistered._id);
    // console.log(accessToken,"\n", refreshToken)
    const cookieOptions={
    httpOnly:true, //the cookie cant be ready by client
    secure:true
}

     res.status(200)
    .cookie("AccessToken",accessToken,cookieOptions)  //setting the cookies
    .cookie("RefreshToken",refreshToken,cookieOptions)
    .json("Welcome user")
    const getCookies= req.cookies
    // console.log(getCookies)    //getting the cookies
    // console.log(getCookies['Refresh Token'])
}
const logoutUser= async (req,res)=>{
    // console.log(req.loggedInUser._id)
    if (!req.loggedInUser || !req.loggedInUser._id) {
        return res.status(401).json("User not authenticated");
    }
   const loggedInUser=req.loggedInUser

   loggedInUser.refreshToken = undefined;
   await loggedInUser.save();

    const cookieOptions={
        httpOnly:true,
        secure:true
    }
    return res.status(201)
    .clearCookie("AccessToken",cookieOptions)
    .clearCookie("RefreshToken",cookieOptions)
    .json("User Logged Out")
}


//Refreshing access Token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.RefreshToken || req.body.refreshToken;
        
        if (!incomingRefreshToken) {
            return res.status(401).json("Unauthorized request");
        }



        // Verify the incoming refresh token
        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedRefreshToken._id);
        
        if (!user) {
            return res.status(401).json("Invalid token");
        }

        // Log tokens for comparison
        // console.log("Incoming refresh token:", incomingRefreshToken);
        // console.log("Stored refresh token:", user.refreshToken);

        // Ensure the incoming token matches the one in the database
        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json("Refresh token expired or used");
        }

        // Generate new tokens
        const { accessToken, refreshToken:newRefreshToken } = await generateAccessRefreshToken(user._id);
        // console.log("New refresh token:", newRefreshToken);
        // console.log(accessToken)

        // Update user's refresh token and save
        // user.refreshToken = newRefreshToken;
        // await user.save();

        // Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,  // Set to false for local testing if not using HTTPS
        };

        res.status(201)
            .cookie("AccessToken", accessToken, cookieOptions)
            .cookie("RefreshToken", newRefreshToken, cookieOptions)
            .json("Token refreshed");

    } catch (error) {
        console.log("Error occurred while decoding the tokens:", error.message);
        return res.status(500).json("Internal Server Error");
    }
};


//change password

const changePassword= async(req,res)=>{
try {
        const {currentPassword, newPassword, confirmPassword}=req.body
        // console.log(currentPassword, newPassword, confirmPassword)
        const loggedInUser=req.loggedInUser
        if(newPassword.length<8){
            return res.status(400).json("Password should be of minimum 8 characters")
        }
        
        const checkPassword= await loggedInUser.comparePassword(currentPassword)
        if(!checkPassword){
            return res.status(401).json("Enter the correct current password")
        }
        if(newPassword===currentPassword){
            return res.status(401).json("The new password cant be same as old password")
        }
        if(newPassword!==confirmPassword){
            return res.status(401).json("The passwords should match")
        }
        loggedInUser.password= newPassword
        await loggedInUser.save();
        return res.status(200).json("Password updated.")
} catch (error) {
    console.log("Error occured:",error)
}
}


//check email
const generateOTP=async(req,res)=>{
   try {
     const email=req.body.email
     const user= await User.findOne({email:email})
     if(!user){
         return res.status(401).json("No user found")
     }
     const OTP= crypto.randomInt(1000,9999).toString();
     const otpExpiry=Date.now()+2*60*1000;
     user.OTP=OTP;
     user.otpExpiry=otpExpiry
     await user.save();
     await mailer(email,"Your OTP",`Dear ${user.fullName}, your otp is ${OTP}, and will expire in 2 minutes.`)
     return res.status(200).json("OTP Succesfully Sent to User")
   } catch (error) {
    console.log("Error occured", error.message)
    return res.status(500).json("Error occured while sending otp")
   }

}
//forget password
const forgetPassword= async(req, res)=>{
 try {
    const {email,changePassword,confirmPassword,OTP} =req.body  
    const user= await User.findOne({email:email})
    // console.log(user.email)
    // console.log(user.OTP)
    if(!user){
        return res.status(401).json("No user found")
    }
    if(OTP!=user.OTP){
        return res.status(401).json("Invalid otp")
    }
    if(changePassword.length<8){
        return res.status(303).json("Password should be minimum of 8 characters")
    }
    if(await user.comparePassword(changePassword)){
        return res.status(401).json("New password cant be same as old password")
    }
    if(changePassword!==confirmPassword){
        return res.status(401).json("Passwords doesnt match")
    }
    if(Date.now()>user.otpExpiry){
        user.OTP=undefined
        user.otpExpiry=undefined
        await user.save();
        return res.status(401).json("OTP expired. Please try again")
    }
    user.password=changePassword
    user.OTP=undefined
    user.otpExpiry=undefined
    await user.save();
    return res.status(200).send({
        success:true,
        message: "Password Changed Succesfully"
    });
} catch (error) {
    console.log("Error occurred:", error.message);
    return res.status(500).send({
        message: "Error occurred while sending mail"
    });
}
};



 //exporting the functions
export {registerUser, userLogin, logoutUser, refreshAccessToken, changePassword, forgetPassword,generateOTP}
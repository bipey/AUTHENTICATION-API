import mongoose from "mongoose";
import { validate } from "email-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import'dotenv/config';
const userSchema= new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        validate: {
            validator: validate, // Use the validator library's isEmail function
            message: "Invalid email format",
        },
    },
    password:{
        type:String,
      
        min:8
    },
    confirmPassword:{
        type:String,
     
    },
    refreshToken:{
        type:String
        
    },
    OTP:{
        type:String,
    },
    otpExpiry:{
        type:Date
    }
},
{timestamps:true})

//pre hooks executes before operation in db
userSchema.pre("save",async function(next){
    try {
     const emailValidator=validate(this.email)
     if(!emailValidator){
        next();
     }
    } catch (error) {
        console.log("Error occured while validation email")
        next();
    }
    if(!this.isModified("password")){ //CHECKS IF THE PASSWORD IS MODIFIED OR NOT, ONLY HASHES IF THE PW IS MODIFIED
        return next();
    }
    try {
        this.password=await bcrypt.hash(this.password,8)
    } catch (error) {
        console.log("Error occured while hashing passw0rd")
    }
    this.confirmPassword=undefined
    
})

// userSchema.pre("save",async function(next) {
//     if(!this.isModified("password")){ //CHECKS IF THE PASSWORD IS MODIFIED OR NOT, ONLY HASHES IF THE PW IS MODIFIED
//         return next();
//     }
//     try {
//         this.password=await bcrypt.hash(this.password,8)
//     } catch (error) {
//         console.log("Error occured while hashing passw0rd")
//     }
    
// })

//post hook occur after operation in db
userSchema.post("save",async function(){
    const savedData= this.toObject();
    delete savedData.password;
    delete savedData.refreshToken;
    console.log("Data saved", savedData)
})
userSchema.post("updateOne",async function(){
    console.log("Db updated")
})





//methods to compare password
userSchema.methods.comparePassword=async function (password) {
    return await bcrypt.compare(password, this.password)
}


//methods to generate access and refresh token
userSchema.methods.generateAccessToken=async function (){
    // console.log(process.env.ACCESS_TOKEN_SECRET)
   return jwt.sign({
        _id:this._id,
        email:this.email
    },
process.env.ACCESS_TOKEN_SECRET,
{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
    
}


userSchema.methods.generateRefreshToken=async function() {
    return jwt.sign({
        _id:this._id,
        email:this.email
    },
process.env.REFRESH_TOKEN_SECRET,
{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
    
}




export const User= mongoose.model("User",userSchema)
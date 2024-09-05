import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import 'dotenv/config';

export const verifyJwt=(async (req,res,next)=>{
    try {
        const token=  req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log(token)
        if(!token){
           return res.status(422).json("No cookie found")
        }
        const decodedToken=  await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken){
            return res.status(401).json("The session has expired. Please login")
        }
        // console.log("decodedtoken",decodedToken._id)
        const loggedInUser= await User.findById(decodedToken._id)
        // console.log("Logged n user id",loggedInUser._id)
        if(!loggedInUser){
            return res.status(401).json("Invalid token. Please login")
        }
        req.loggedInUser=loggedInUser
        // console.log(req.loggedInUser._id)
        next();
        
    } catch (error) {
        console.log("Internal sever error while fetching the credentials", error)
        return res.status(500).json("Internal sever error while fetching the credentials")
    }
})

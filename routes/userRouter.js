import { Router } from "express";
import { changePassword, forgetPassword, generateOTP, getUserChannelProfile, logoutUser, oauthRegister, refreshAccessToken, registerUser, userLogin } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import passport from "passport"
const router=new Router();

router.route("/register").post(registerUser)

router.route("/oauth").get(passport.authenticate("google",{
    scope:["profile", "email"]
}))

router.route("/oauth/google").get(passport.authenticate("google", { failureRedirect: '/' }),oauthRegister)

router.route("/login").post(userLogin)

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh").post(refreshAccessToken)

router.route("/changepassword").post(verifyJwt, changePassword)

router.route("/sendOTP").post(generateOTP)

router.route("/forgetPassword").post(forgetPassword)

router.route("/getProfile/:userName").get(verifyJwt,getUserChannelProfile)


export default router


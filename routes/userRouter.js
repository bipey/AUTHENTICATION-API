import { Router } from "express";
import { changePassword, forgetPassword, generateOTP, logoutUser, refreshAccessToken, registerUser, userLogin } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=new Router();
router.route("/register").post(registerUser)

router.route("/login").post(userLogin)

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh").post(refreshAccessToken)

router.route("/changepassword").post(verifyJwt, changePassword)

router.route("/sendOTP").post(generateOTP)

router.route("/forgetPassword").post(forgetPassword)
export default router


import express from "express"
import "dotenv/config"
import { connctDb } from "../database/dab_connect.js"
import userRouter from "../routes/userRouter.js"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import session from "express-session";
import passport from "passport"
import configurePassport from "../utils/passportConfig.js"

const app = express()
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Use express-session middleware
app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true for HTTPS
  }));
  app.use(passport.initialize());
  app.use(passport.session());
const port=process.env.PORT||3000

app.get("/",(req,res)=>{
    res.json("hello world")
})
app.use("/user",userRouter);

connctDb().then(()=>{
    configurePassport();
app.listen(port,(req,res)=>{
    console.log("Server running at",port)

})})
.catch((error)=>{
    console.log("An error occured")
})
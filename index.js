import express from "express"
import "dotenv/config"
import { connctDb } from "./database/dab_connect.js"
import userRouter from "./routes/userRouter.js"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
const app = express()
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


const port=process.env.PORT||3000

// app.get("/",(req,res)=>{
//     res.json("hello world")
// })
app.use("/user",userRouter);
connctDb().then(()=>{
   app.get("/",(req,res)=>{
    res.json("hello world")})
app.listen(port,(req,res)=>{
    console.log("Server running at",port)

})})
.catch((error)=>{
    console.log("An error occured")
})
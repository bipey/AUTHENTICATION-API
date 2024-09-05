import nodemailer from "nodemailer";
import "dotenv/config";

 export const mailer=async(receiver, subject, message)=>{
    
const transporter= nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.SENDER_EMAIL,
        pass:process.env.SENDER_EMAIL_PASSWORD
    }});
    const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:receiver,
        subject:subject,
        text:message
    };
    try {
        const sendEmail= await transporter.sendMail(mailOptions)
        if(!sendEmail){
            console.log("Wrong credentials")
        }
    } catch (error) {
        console.log("error occured",error.message)
        return false
    }
 }
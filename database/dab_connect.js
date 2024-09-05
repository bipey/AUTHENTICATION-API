import mongoose from "mongoose";
const connctDb=  async()=>{
    try {
        // console.log(process.env.DB_NAME,process.env.DB_STRING)
        const conn=await mongoose.connect(`${process.env.DB_STRING}/${process.env.DB_NAME}`);
        console.log("Database connected")
    } catch (error) {
        console.log("Couldnt connect to the database",error)
        process.exit(1)
    }
}
export{connctDb}
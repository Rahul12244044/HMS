import mongoose from "mongoose";
const otpSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    otp:{type:Number,required:true},
    expiresAt:{type:Date,required:true} // TTL index for auto-delete
});
const otpModel=mongoose.model("Otp",otpSchema);
export default otpModel;
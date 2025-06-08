import mongoose from "mongoose";
const doctorSchema=new mongoose.Schema({
    doctorId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    token:[{type:String,required:true}]
});
export const doctorModel=mongoose.model("DoctorToken",doctorSchema);

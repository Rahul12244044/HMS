import mongoose from "mongoose";
const feedbackSchema=new mongoose.Schema({
    doctorId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    patientId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    feedback:{type:String},
    rating: { type: Number, required: true, min: 1, max: 5 }
});
export const feedModel=mongoose.model("FeedBacks",feedbackSchema);
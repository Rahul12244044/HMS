import {userModel} from "../models/user.models.js";
import {doctorModel} from "../models/doctor.schema.js";
export const addDoctors=async (req,res)=>{
    try{
        const doctors=req.body;
        await userModel.insertMany(doctors);
        console.log(doctors);

        return res.status(201).json({message:"Doctors are added successfully."});
    }catch(err){
        return res.status(500).json({message:"Internal Server Error"});
    }
}
export const createDoctorTokens=async (req,res)=>{
    try{
    const allDoctors=await userModel.find({type:"doctor"});
    console.log(allDoctors);
    for(let r=0;r<allDoctors.length;r++){
        let oneDoctor=allDoctors[r];
        console.log("oneDoctor: ");
        console.log(oneDoctor);
        const cleanDoctor=oneDoctor.name.replace(/[^a-zA-Z0-9 ]/g, "");
        const doctorNameToken=cleanDoctor.split(" ");
        const doctorDescriptionToken=oneDoctor.description.split(" ");
        const doctorToken=[...doctorNameToken,...doctorDescriptionToken];
        console.log(doctorToken);
        await doctorModel.create({doctorId:oneDoctor._id,token:doctorToken});
    }
    return res.status(200).json({message:"Tokens are added successfully."});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Interval Server Error"});
    }
}
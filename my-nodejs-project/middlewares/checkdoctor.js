import {userModel} from "../src/models/user.models.js";
export const checkIsItDoctorMiddleware=async (req,res,next)=>{
    try{
       const {userId}=req.user;
       console.log("checkIsItDoctor");
    //    console.log(userId);
       const isDoctor=await userModel.findById(userId); 
    //    console.log(isDoctor);
       if(isDoctor.type=="doctor"){
        next();
       }else{
        return res.status(404).json({message:"This is only for doctors"});
       }
       console.log(isDoctor);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
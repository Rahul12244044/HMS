import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel} from '../models/user.models.js';
import {doctorModel} from "../models/doctor.schema.js"; 
import {feedModel} from "../models/feedback.schema.js";
import {slotModel} from "../models/slots.schema.js";
import otpModel from '../models/otp.schema.js';
import {bookingModel} from "../models/booking.schema.js";
import {ObjectId} from "mongodb";
import axios from "axios";
const apikeyforOtp="lOPftT4NkMVSic2yudxn3DB8eGmFozgQ0rIUJhbLW16vqEsCR9rg2oCyKS3WhfkelHTzaYFGQ05R4mAi";
import { sendMail } from '../../config/nodemailer.js';

export const userSignUp = async (req, res) => {
    try {
        const userInfo = req.body;
        const user = new userModel(userInfo);
        await user.save();
        res.status(201).json({ message: 'User registered successfully!', user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const userSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, type: user.type },
            'jsjfioewrnkldifiewrqnmsdrew',
            { expiresIn: '1h' }
        );
        await sendMail(email);
        res.cookie('tokenAuth',token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        return res.status(200).json({ message: 'Sign in successful', token, user });
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ message: 'Error signing in', error: error.message });
    }
};
export const userMobileOtp = async (req, res) => {
    const { mobileNo, token } = req.body;
    console.log("mobileNo: " + mobileNo);
    const decode = await jwt.verify(token, "jsjfioewrnkldifiewrqnmsdrew");
    console.log(decode);
    const { userId, email } = decode;
    const isUserFound = await userModel.findOne({ _id: userId });
    if (!isUserFound) {
        return res.status(400).json({ message: "user not found" });
    }
    // Generate a random 4-digit OTP
    // isUserFound.mobileNo = mobileNo;
    // await isUserFound.save();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("otp: " + otp);
    await otpModel.create({userId:userId,otp:otp,expriresAt:new Date(Date.now()+60*1000)});

    // Set OTP expiration to 1 minute from now
    // const expiresAt = new Date(Date.now() + 60 * 1000);
    // Store OTP in database
    // await OtpModel.create({ userId, otp, expiresAt });
    const otpSendApi = `https://www.fast2sms.com/dev/bulkV2?authorization=${apikeyforOtp}&variables_values=${otp}&route=otp&numbers=${mobileNo}`;
    try {
        const response = await axios.get(otpSendApi);
        console.log("respone: " + response);
        if (response.data.return) {
            res.status(200).json({ message: "OTP sent and stored", decode });
        } else {
            res.status(400).json({ message: "Failed to send OTP" });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Failed to send OTP" });
    }
};
export const verifyMobileOtp=async (req,res)=>{
    const {token,otp,mobileNo}=req.body;
    const userId=req.user.userId;
    const isFound=await otpModel.findOne({userId:userId,otp:otp});
    if(!isFound){
        return res.status(400).json({message:"otp not found"});
    }else{
    const currentTime=new Date(Date.now());
    if(currentTime>isFound.expiresAt){
        return res.status(400).json({message:"otp expired"});
    }else{
        const user=await userModel.findOne({_id:userId});
        user.mobileNo=mobileNo;
        user.isMobileNumbrerVerified=true;
        await user.save();
        await otpModel.deleteMany({userId:userId});
        return res.status(200).json({message:"otp verified and mobile number updated"});

    }
    }
};
export const sendingMail=async (req,res)=>{
    try{
    const {to,subject,text}=req.body;
    console.log("to: "+to);
    console.log("subject: "+subject);
    console.log("text: "+text);
    await sendMail(to,subject,text);
    return res.status(200).json({message:"mail sent successfulyl"});
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"failed to send mail"});
    }

};
export const addPatientFeedback=async (req,res)=>{
    try{
    console.log("req.user: ");
    console.log(req.user);
    const {userId}=req.user;
    const {doctorId,feedback,rating}=req.body;
    const newFeedback=await feedModel.create({doctorId,patientId:userId,feedback,rating});
    const doctor=await userModel.findOne({_id:new ObjectId(doctorId)});
    const patient=await userModel.findOne({_id:new ObjectId(userId)});
    doctor.feedbackRecieved.push(newFeedback._id);
    patient.patientFeedback.push(newFeedback._id);
    await doctor.save();
    await patient.save();
    return res.status(200).json({message:"feedback added successfully."});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error."});
    }
}
export const addSlot=async (req,res)=>{
    try{
    const {userId}=req.user;
    console.log("userId: ");
    console.log(userId);
    const {slots}=req.body;
    console.log("slots");
    console.log(slots);
    console.log("req.body");
    console.log(req.body);
    const isFoundAnySlot=await slotModel.findOne({doctorId:new ObjectId(userId)});
    if(isFoundAnySlot){
        isFoundAnySlot.availableSlots=slots;
        await isFoundAnySlot.save();
        return res.status(201).json({message:"slots are updated successfully"});
    }else{
    console.log("isSlotFound");
    await slotModel.create({doctorId:userId,availableSlots:slots});
    return res.status(201).json({message:"Slots are added successfully"});
    }
    }catch(err){
    console.log(err);
    return res.status(500).json({message:"Internal Server Error"});
    }

}
export const showAllSlots=async (req,res)=>{
    try{
    const doctorId=req.params.doctorId;
    console.log(doctorId);
    const doctorSlots=await slotModel.findOne({doctorId:new ObjectId(doctorId)});
    const {availableSlots}=doctorSlots;
    console.log(availableSlots);
    if(!availableSlots){
        return res.status(404).json({message:"No Slots are Available."});
    }else{
        return res.status(200).json({message:"all Slots",availableSlots});
    }
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});
    }
}
export const bookAppointment=async (req,res)=>{
    try{
        const {doctorId,date,time,reason}=req.body;
        const {userId}=req.user;
        const patientId=userId;
        const doctor = await slotModel.findOne({doctorId:doctorId});
        console.log("doctor: ");
        console.log(doctor);
        if(doctorId===patientId){
            return res.status(403).json({message:"you cannot booking yourself."});
        }
        if(!doctor){
            return res.status(400).json({ success: false,message: "doctor not found"});
        }
        const dateSlots = doctor.availableSlots.get(date);
        if (!dateSlots || !dateSlots.includes(time)) {
           return res.status(400).json({success: false, message: "Selected time is not available."});
        }
        const savedAppointment= await bookingModel.create({doctorId,patientId,date,time,reason});
        await slotModel.updateOne(
        { doctorId:new ObjectId(doctorId)},
        {
        $pull: { [`availableSlots.${date}`]: time }
        });
        return res.status(200).json({ success: true,message: "Appointment booked successfully.",appointment: savedAppointment});

    }catch(err){
       if (err.code === 11000) {
        return res.status(400).json({ success: false, message: "This time slot is already booked. Please choose another."});
        }
        console.log(err);
        return res.status(500).json({success: false, message: "An error occurred while booking the appointment."}); 
    }
}
export const cancelAppointment=async (req,res)=>{
    try{
        console.log("cancelAppointment");
        console.log(req.user);
        const {userId}=req.user;
        console.log("req.params: ");
        console.log(req.params);
        console.log(req.params.appointmentId);
        const {appointmentId}=req.params;
        console.log("appointmentId: ");
        console.log(appointmentId);
        const appointment=await bookingModel.findOne({_id:new ObjectId(appointmentId),patientId:new ObjectId(userId)});
        console.log("isAppointmentFound");
        console.log(appointment);
        if(!appointment){
            return res.status(404).json({success:false,message:"Appointment not found"});
        }
        const {doctorId,date,time}=appointment;
        await bookingModel.deleteOne({_id:appointmentId});
        //update the available slot for the doctor
        const slotDoc = await slotModel.findOne({ doctorId: new ObjectId(doctorId) });

        if (slotDoc) {
        const currentSlots = slotDoc.availableSlots.get(date) || [];
        // Add the canceled time back to the list (prevent duplication)
       if (!currentSlots.includes(time)) {
          currentSlots.push(time);
        }
        // Sort the times if needed
        currentSlots.sort(); 

       // Save the updated slots
       slotDoc.availableSlots.set(date, currentSlots);
       await slotDoc.save();
    }
       return res.status(200).json({success: true,message: "Appointment cancelled and slot made available again.",});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
export const getAllBookingsForDoctor=async (req,res)=>{
    try{
        const {userId}=req.user;
        console.log(userId);
        const allBookings=await bookingModel.find({doctorId:new ObjectId(userId)});
        if(allBookings.length==0){
            return res.status(404).json({message:"There are no Bookings"});
        }
        res.status(200).json({success:true,message:"All bookings: ",allBookings});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
export const allPatientBookings=async (req,res)=>{
    try{
        const {userId}=req.user;
        console.log(userId);
        const patientAllBookings=await bookingModel.find({patientId:new ObjectId(userId)});
        console.log(patientAllBookings);
        if(patientAllBookings.length==0){
            return res.status(404).json({message:"There is no bookings"});
        }
        return res.status(200).json({success:true,message:"All bookings: ",patientAllBookings});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error"});
    }
}
export const updateBooking=async (req,res)=>{
    try{
        const {bookingId}=req.params;
        const {userId}=req.user;
        const {time,date,reason}=req.body;
        const isBookingFound=await bookingModel.findOne({_id:new ObjectId(bookingId),patientId:new ObjectId(userId)});
        console.log(isBookingFound);
        const oldDate=isBookingFound.date;
        const oldTime=isBookingFound.time;
        if(!isBookingFound){
            return res.status(404).json({message:"No appointment"});
        }
        isBookingFound.date=date;
        isBookingFound.time=time;
        isBookingFound.reason=reason;
        await isBookingFound.save();
        const {doctorId}=isBookingFound;
        const doctorSlot=await slotModel.findOne({doctorId:new ObjectId(doctorId)});
        console.log(doctorSlot);
        const allSlotsOnDate=doctorSlot.availableSlots.get(date) || [];
        if(allSlotsOnDate.length==0){
            return res.status(404).json({message:"There is no slots are available on this date."});
        }
        console.log(allSlotsOnDate);
        const isTimeAvailable=allSlotsOnDate.includes(time);
        if(!isTimeAvailable){
            return res.status(404).json({message:"Please select another time this time is not available in time slot."});
        }
        await slotModel.updateOne(
        { doctorId:new ObjectId(doctorId)},
        {
        $pull: { [`availableSlots.${date}`]: time }
        });

        await slotModel.updateOne(
        { doctorId: new ObjectId(doctorId) },
        {
        $addToSet: { [`availableSlots.${oldDate}`]: oldTime }
        });
        return res.status(200).json({ message: "Booking updated successfully." });

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error."});
    }
}
export const testController=(req,res)=>{
    const headers=req.headers;
    const token=headers.authorization;;
    console.log(headers.authorization);
    const isFound=jwt.verify(token,"jsjfioewrnkldifiewrqnmsdrew");
    console.log(isFound);
    return res.status(200).json({message:"test controller"});
};
export const searchDoctors=async (req,res)=>{
    try{
    const searchQuery=req.body.query;
    const cleanSearchQuery=searchQuery.replace(/[^a-zA-Z0-9 ]/g, "");
    const searchToken=cleanSearchQuery.split(" ");
    console.log(searchToken);
    const allTokens=await doctorModel.find({});
    // console.log("allDoctorsToken");
    // console.log(allTokens);
    let arrTokens=[];
    let allItems=[];
    for(let r=0;r<allTokens.length;r++){
        let oneToken=allTokens[r].token;
        let score=0;
        for(let k=0;k<searchToken.length;k++){
            if(oneToken.includes(searchToken[k])){
                score++;
            }
        }
        arrTokens.push({doctorId:allTokens[r].doctorId,score});
    }
    arrTokens.sort((a, b) => b.score - a.score);
    // console.log(arrTokens);
    for(let r=0;r<arrTokens.length;r++){
        console.log(arrTokens[r].score);
        const oneItem=await userModel.findOne({_id:arrTokens[r].doctorId});
        if(arrTokens[r].score>0){
            allItems.push(oneItem);
        }
    }
    console.log(allItems);
    return res.status(200).json({message:"look into the search query.",allItems});

    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Internal Server Error"});
    }
    

}
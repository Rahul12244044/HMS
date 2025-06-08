import express from "express";
const userRouter=express.Router();
import { userSignIn, userSignUp ,userMobileOtp,verifyMobileOtp,sendingMail,
    testController,searchDoctors,addPatientFeedback,addSlot,showAllSlots,
    bookAppointment,cancelAppointment,getAllBookingsForDoctor,allPatientBookings,updateBooking} from "../controllers/user.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {checkIsItDoctorMiddleware} from "../../middlewares/checkdoctor.js";

userRouter.post("/signup",userSignUp);
userRouter.get("/signin",userSignIn);
userRouter.get("/send-mobile-otp",userMobileOtp);
userRouter.get("/verify-mobile-otp",authMiddleware,verifyMobileOtp);
userRouter.post("/sendMail",sendingMail);
userRouter.get("/test",testController);
userRouter.get("/searchDoctors",searchDoctors);
userRouter.post("/add-feedback",authMiddleware,addPatientFeedback);
userRouter.post("/add-available-slot",authMiddleware,checkIsItDoctorMiddleware,addSlot);
userRouter.get("/allSlots/:doctorId",showAllSlots);
userRouter.post("/bookAppointment",authMiddleware,bookAppointment);
userRouter.post("/cancelBooking/:appointmentId",authMiddleware,cancelAppointment);
userRouter.get("/allBookings",authMiddleware,checkIsItDoctorMiddleware,getAllBookingsForDoctor);
userRouter.get("/allPatientBookings",authMiddleware,allPatientBookings);
userRouter.put("/updateBooking/:bookingId",authMiddleware,updateBooking);
export default userRouter;
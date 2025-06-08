import express from "express";
import {addDoctors,createDoctorTokens} from "../src/controllers/admin.controller.js";
const adminRouter=express.Router();
adminRouter.post("/addDoctors",addDoctors);
adminRouter.get("/createDoctorTokens",createDoctorTokens);
export default adminRouter;

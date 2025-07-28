import express from 'express';
import mongoose from 'mongoose';
import { connectToMongoDB } from './config/connect.mongoose.js';
import { userSignUp, userSignIn } from './src/controllers/user.controller.js';
import userRouter from "./src/routes/user.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
// import feedbackRouter from "./routes/feedback.router.js";
import { sendMail } from './config/nodemailer.js';
import "./config/nodemailer.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
const app = express();
const PORT = process.env.PORT || 3200;

// Connect to MongoDB before starting the server
connectToMongoDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use("/files", express.static("files"));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.post('/upload', function(req, res) {
    console.log("uploads: ");
    console.log(req.files);
    req.files.file.mv("./files/"+req.files.file.name,(err)=>{
        if(err){
        return res.status(500).json({ error: 'Upload failed' });
        }
        res.status(200).json({ message: 'Upload successful' });
    })
});
// POST /api/signup endpoint
app.use('/api/user', userRouter);
app.use("/api/admin",adminRouter);

// app.use("/api/feedback",feedbackRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
    console.log("now we are in the server");
    console.log(`Server is running on http://localhost:${PORT}`);
});
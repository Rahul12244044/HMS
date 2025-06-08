import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    mobileNo:{type:Number,required:true},
    isMobileNumbrerVerified:{type:Boolean,default:false},
    type:{type:String,required:true,enum:["admin","patient","doctor"]},
    address:{type:String,required:true},
    age:{type:Number,required:true},
    gender:{type:String,required:true,enum:["M","F","O"]},
    description:{type:String},
    feedbackRecieved:[{type:mongoose.Schema.ObjectId,ref:"FeedBacks"}],
    patientFeedback:[{type:mongoose.Schema.ObjectId,ref:"FeedBacks"}],

    
});
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
export const userModel = mongoose.model('User', userSchema);


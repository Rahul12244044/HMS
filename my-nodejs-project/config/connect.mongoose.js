import mongoose from 'mongoose';


const MONGODB_URI = 'mongodb+srv://RahulCompany:Ok6x4vouhICgLqyP@cluster0.nxeid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

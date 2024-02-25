// mongoose.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbUri = process.env.APP_MONGODB_URI;



async function initializeMongoose() {
  if (!dbUri) {
    console.error('MongoDB URI is not defined in the environment variables.');
    return;
  }

  try {
    await mongoose.connect(dbUri);
    console.log(`MongoDB connected to: ${process.env.APP_MONGODB_URI}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Handle the error appropriately
  }
}

export default initializeMongoose;


import { v2 as cloudinary } from 'cloudinary' 
import multer from 'multer'
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const multerUpload = upload.array('images'); // Middleware for handling file uploads

// Function to handle file uploads to Cloudinary
export const uploadImagesToCloudinary = async (files: any) => {

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };


  try {
    const uploadedImagesUrls: string[] = [];
  

    for (const file of files.images) {
      const base64String = Buffer.from(file.data).toString('base64');

      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64String}`,options);
      uploadedImagesUrls.push(result.secure_url);
    }
    return uploadedImagesUrls;
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error);
    throw new Error('An error occurred while uploading images to Cloudinary');
  }
};

export function generateStudentId(): string {
    const minId = 1000; // Minimum student ID
    const maxId = 9999; // Maximum student ID
  
    // Generate a random number within the specified range
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  
    // Convert the random number to a string and return it as the student ID
    return randomId.toString();
  }


  export function generateRandomFileName(length:number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomFileName = "";
    for (let i = 0; i < length; i++) {
      randomFileName += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomFileName;
  }
  


 
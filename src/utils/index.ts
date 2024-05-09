
import { v2 as cloudinary } from 'cloudinary' 
import multer from 'multer'
import 'dotenv/config';
//import fs from 'fs';
import XLSX from 'xlsx';
// import csv from 'csv-parser';
// import { Readable } from 'stream';

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


export async function uploadAudioToCloudinary(files: any): Promise<string[]> {
  const audioUrls: string[] = [];

  // Check if there are audio files
  if (!files.audio) {
    return audioUrls;
  }

  const audioFile = files.audio;

  // Upload audio files to Cloudinary
  for (let i = 0; i < audioFile.length; i++) {
    const result = await cloudinary.uploader.upload(audioFile[i].tempFilePath, {
      resource_type: 'video',
      folder: 'audio' // Optional: Save audio files in a specific folder in Cloudinary
    });
    audioUrls.push(result.secure_url);
  }

  return audioUrls;
}
// Function to handle file uploads to Cloudinary
export const uploadImagesToCloudinary = async (files: any) => {

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };


let images =Array.isArray(files.images) ? files.images : [files.images];


  try {
    const uploadedImagesUrls: string[] = [];
  

    for (const file of images) {
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


  export function generateRandomString(length:number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomFileName = "";
    for (let i = 0; i < length; i++) {
      randomFileName += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomFileName;
  }

//   interface RowData {
//     email: string;
//     mobile: string;
//     firstname: string;
//     middlename: string;
//     lastname: string;
//     // Add other fields as needed
// }

 export async function parseFile(file: Express.Multer.File) {

  //@ts-ignore
  const buffer:any = file?.data;
  if (!buffer) {
      throw new Error('File buffer not found');
  }
  const workbook = XLSX.read(buffer);
    const sheet_name = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheet_name];

    // Parse the entire sheet data
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Extract header and data rows
    let header: string[] = [];
    let rows: any[] = [];

    if (data.length > 0) {
        header = data[0] as string[];
        rows = data.slice(1);
    }

    // Convert data to array of objects
    const dataArray = rows.map(row => {
        const rowData: { [key: string]: any } = {};
        header.forEach((key, index) => {
            rowData[key] = row[index];
        });
        return rowData;
    });

    return dataArray;
}

export function generateCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
  }

  return code;
}


 
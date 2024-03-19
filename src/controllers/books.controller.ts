
import { Request, Response } from "express";
import Books from '../models/book';
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary' 

import { AssemblyAI } from 'assemblyai'

import {uploadImagesToCloudinary} from '../utils/index'
const ElevenLabs = require("elevenlabs-node");
//import { PassThrough } from 'stream';
// import * as fs from 'fs-extra';
import axios from 'axios';
// import path from 'path'
import { createWorker } from 'tesseract.js';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function createBook(req: Request, res: Response) {
  try {
    // Check if there are uploaded files
    if (!req.files) {
      return res.status(400).json({ error: 'Please upload at least one image' });
    }

    // Upload images to Cloudinary
    const uploadedImagesUrls = await uploadImagesToCloudinary(req.files);

    // Create a new book instance with data from the request body
    const data = req.body;
    const book = new Books(data);


    if (!Array.isArray(book.photos) || !Array.isArray(book.page)) {
      throw new Error('book.photos is not an array');
    }

    // Ensure book.photos is initialized as an array if it's not already
    // book.photos = (book.photos || []);


    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);

  

    console.log(uploadedImagesUrls.length);

    for (let x = 0; x < uploadedImagesUrls.length; x++) {
      // The img to text
      const worker = await createWorker('eng');
      const ret = await worker.recognize(uploadedImagesUrls[x]);
      book.page.push(ret.data.text);
      await worker.terminate();

      const XI_API_KEY = process.env.ELEVEN_LABS_KEY;
      const VOICE_ID = 'kxxDJmlV0nGw5ttpzZqr';
      const textToSpeak = ret.data.text;

      try {
        const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          text: textToSpeak,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }, {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': XI_API_KEY,
          },
          responseType: 'stream'
        });

        const audioData = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          response.data.on('data', (chunk:any) => chunks.push(chunk));
          response.data.on('end', () => resolve(Buffer.concat(chunks)));
          response.data.on('error', (error:any) => reject(error));
        });

        // Upload audio data to Cloudinary
        await cloudinary.uploader.upload_stream({ resource_type: "video" }, async (error:any, result:any) => {
          if (error) {
            console.error('Error uploading audio to Cloudinary:', error);
            return;
          }
          // Once uploaded successfully, you can access the URL in result.secure_url
          console.log('Audio uploaded to Cloudinary:', result.secure_url);
          // Here, you can save the Cloudinary URL to your database or any other necessary action
         
          if (!Array.isArray(book.audio)) {
            throw new Error('book.page is not an array');
          }

          // For example:
          book.audio.push(result.secure_url);
          // Save the book to the database
          

          const client = new AssemblyAI({
            apiKey: "3b7a960b7d304bef9b2ad6df971d6090"
          });

          const audioUrl = result.secure_url; // Access the Cloudinary URL here

          const config = {
            audio_url: audioUrl
          };

          const transcript = await client.transcripts.create(config);
          console.log("words "+transcript.words);

          if (!Array.isArray(book.timestamp)) {
            throw new Error('book.page is not an array');
          }

          book.timestamp.push(transcript.words);

          await book.save();

          // After all asynchronous operations are done, send the book object as a response
         
        }).end(audioData);
      } catch (error) {
        console.error('Error processing audio:', error);
      }
    }
    await book.save();
    res.send(book)
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'An error occurred while creating the book' });
  }
}



export async function getAllBook(req: Request, res: Response) {

  console.log("hello")
  const data = req.body;
  const book = await Books.find(data);

  res.send(book)

}

export async function getSingleBook(req: Request, res: Response) {

    const params = req.params;
    const book = await Books.findById(params.id);

    res.send(book)

}



export async function updateSingleBook(req: Request, res: Response) {

    const params = req.params;
    const body = req.body;
    const book = await Books.findByIdAndUpdate(params?.id,body);

    res.send(book)

}



export async function userSubscription(_: Request , res: Response) {


try {
  const voice = new ElevenLabs(
    {
        apiKey:  process.env.ELEVEN_LABS_KEY, // Your API key from Elevenlabs
    }
);

voice.getUserSubscription().then((res:any) => {
 
  return res;
});
 
 res.send('ok');
} catch (error) {
   
  console.log({error})
  res.send(error)
}

}
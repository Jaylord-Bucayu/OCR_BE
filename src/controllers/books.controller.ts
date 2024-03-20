
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

    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);

  for (let x = 0; x < uploadedImagesUrls.length; x++) {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(uploadedImagesUrls[x]);
  book.page.push(ret.data.text);
  await worker.terminate();

  console.log("INDEX: " + x);

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

    console.log('ANKUR' + response.data,response.request)

    const audioData = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.data.on('end', () => resolve(Buffer.concat(chunks)));
      response.data.on('error', (error: any) => reject(error));
    });

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "video" }, async (error: any, result: any) => {
        if (error) {
          console.error('Error uploading audio to Cloudinary:', error);
          reject(error);
          return;
        }
        console.log('Audio uploaded to Cloudinary:', result.secure_url);
        resolve(result);
      }).end(audioData);
    });

    if (!Array.isArray(book.audio)) {
      book.audio = [];
    }
    book.audio.push(result.secure_url);

    await book.save();

    const client = new AssemblyAI({
      apiKey: "3b7a960b7d304bef9b2ad6df971d6090"
    });

    const audioUrl = result.secure_url;
    const config = {
      audio_url: audioUrl
    };

    const transcript = await client.transcripts.create(config);

    if (!book.timestamp) {
      book.timestamp = [];
    }

    if (transcript.words) {
      console.log("PUSHED");
      book.timestamp.push(transcript.words);
    }

    await book.save();

  } catch (error) {
    console.error('Error processing audio:', error);
  }
}

    
    
//end for
    await book.save();
    // Send the book object as a response after all asynchronous operations have completed
    res.send(book);

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
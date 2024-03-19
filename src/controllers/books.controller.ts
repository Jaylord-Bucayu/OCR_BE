
import { Request, Response } from "express";
import Books from '../models/book';
import 'dotenv/config';

import { AssemblyAI } from 'assemblyai'

import {uploadImagesToCloudinary, generateRandomFileName} from '../utils/index'
const ElevenLabs = require("elevenlabs-node");
//import { PassThrough } from 'stream';
import fs from 'fs';
import axios from 'axios';
import path from 'path'
import { createWorker } from 'tesseract.js';


export async function createBook(req:Request, res:Response) {
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

    //@ts-ignore
    // Ensure book.photos is initialized as an array if it's not already
    book.photos = (book.photos || []);


    if (!Array.isArray(book.photos) || !Array.isArray(book.page)) {
      throw new Error('book.photos is not an array');
    }

    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);
   
    
    if (!Array.isArray(book.page) || !Array.isArray(book.audio)) {
      throw new Error('book.page is not an array');
    }

    //
     console.log(uploadedImagesUrls.length)
    for(var x=0; x < uploadedImagesUrls.length; x++){

      console.log(x)
      let audio_file_name = generateRandomFileName(10)

        // The img to text
      const worker = await createWorker('eng');
      const ret = await worker.recognize(uploadedImagesUrls[x]);
      //let text_2_audio = ret.data.text;
      book.page.push(ret.data.text);
      await worker.terminate();

    book.audio.push(`${process.env.APP_URL}/audio/${audio_file_name}.mp3`);
    // Save the book to the database
    await book.save();
 
    const XI_API_KEY = process.env.ELEVEN_LABS_KEY; // Replace with your actual xi-api-key
    const VOICE_ID = 'kxxDJmlV0nGw5ttpzZqr'; // Replace with the voice-id you intend to use
    const textToSpeak = ret.data.text;
 
 axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
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
     // 'Authorization': `Bearer ${XI_API_KEY}` 
   },
   responseType: 'stream'
 })
 .then(response => {
   response.data.pipe(fs.createWriteStream(path.join('audio',`${audio_file_name}.mp3`)));
 
 
   console.log('Audio saved as output.mp3');
 })
 .catch(error => {
   console.error(error.message);
 });



const client = new AssemblyAI({
  apiKey: "3b7a960b7d304bef9b2ad6df971d6090"
})

const audioUrl = book.audio[x];
  

const config = {
  audio_url: audioUrl
}


  const transcript = await client.transcripts.create(config)
  console.log(transcript)

  if (!Array.isArray(book.timestamp)) {
    throw new Error('book.page is not an array');
  }

  book.timestamp.push(transcript.words);

  await book.save();




    }

 
  
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
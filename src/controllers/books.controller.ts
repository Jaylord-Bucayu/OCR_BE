
import { Request, Response } from "express";
import Books from '../models/book';

import {uploadImagesToCloudinary} from '../utils/index'
const ElevenLabs = require("elevenlabs-node");
import { PassThrough } from 'stream';
import fs from 'fs';
import axios from 'axios';
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


    if (!Array.isArray(book.photos)) {
      throw new Error('book.photos is not an array');
    }

    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);

    // Save the book to the database
    await book.save();

    // The img to text
    const worker = await createWorker('eng');
    const ret = await worker.recognize(uploadedImagesUrls[0]);
    let text_2_audio = ret.data.text;

    await worker.terminate();
   console.log(ret.data.text)
    if (ret.data.text) {
      // const url = "https://api.elevenlabs.io/v1/text-to-speech/frA4oJkLjNTYC72eQys1";
      // const headers = {
      //   "Accept": "audio/mpeg",
      //   "Content-Type": "application/json",
      //   "xi-api-key": "d618ae405f2a06faef50c2beefb1971c"
      // };

      // const data2 = {
      //   "text": "Check the server logs and responses, Verify that the client-side code is correctly handling the streamed data and writing it to the output file",
      //   "model_id": "eleven_monolingual_v1",
      //   "voice_settings": {
      //     "stability": 0.5,
      //     "similarity_boost": 0.5
      //   }
      // };

     // const response = await axios.post(url, data2, { headers, responseType: 'stream' });
   

    

const voice = new ElevenLabs(
    {
        apiKey:  "0efaa9cc11c9a36d670be87e5e3d6ddf", // Your API key from Elevenlabs
        voiceId: "XzKPoXLAoEQgUewWR7LL",             // A Voice ID from Elevenlabs
    }
);

voice.textToSpeech({
    // Required Parameters
    fileName:        "audio2.mp3",                    // The name of your audio file
    textInput:       ret.data.text,                // The text you wish to convert to speech
    // Optional Parameters
    voiceId:         "XzKPoXLAoEQgUewWR7LL",         // A different Voice ID from the default
    stability:       0.5,                            // The stability for the converted speech
    similarityBoost: 0.5,                            // The similarity boost for the converted speech
    modelId:         "eleven_monolingual_v1",       // The ElevenLabs Model ID
    style:           1,                              // The style exaggeration for the converted speech
    speakerBoost:    true                            // The speaker boost for the converted speech
  }).then((res:any) => {
    // console.log(res);
});// Send the audio stream directly to the client
    }

   

    // Send the book object as a response after all asynchronous operations have completed
    res.json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'An error occurred while creating the book' });
  }
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


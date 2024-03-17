
import { Request, Response } from "express";
import Books from '../models/book';

import {uploadImagesToCloudinary, generateRandomFileName} from '../utils/index'
const ElevenLabs = require("elevenlabs-node");
//import { PassThrough } from 'stream';
import fs from 'fs';
//import axios from 'axios';
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

    const audio_file_name = generateRandomFileName(10)
    const book = new Books(data);

    //@ts-ignore
    // Ensure book.photos is initialized as an array if it's not already
    book.photos = (book.photos || []);


    if (!Array.isArray(book.photos)) {
      throw new Error('book.photos is not an array');
    }

    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);
    book.audio = `http://localhost:5000/audio/${audio_file_name}.mp3`;
    

    // The img to text
    const worker = await createWorker('eng');
    const ret = await worker.recognize(uploadedImagesUrls[0]);
    //let text_2_audio = ret.data.text;

    await worker.terminate();
   console.log(ret.data.text)

   book.text = ret.data.text;

   // Save the book to the database
   await book.save();

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
        apiKey:  "d618ae405f2a06faef50c2beefb1971c", // Your API key from Elevenlabs
        voiceId: "frA4oJkLjNTYC72eQys1",             // A Voice ID from Elevenlabs
    }
);

voice.textToSpeech({
    // Required Parameters
    fileName:        `${audio_file_name}.mp3`,                    // The name of your audio file
    textInput:       ret.data.text,                // The text you wish to convert to speech
    // Optional Parameters
    voiceId:         "frA4oJkLjNTYC72eQys1",         // A different Voice ID from the default
    stability:       0.5,                            // The stability for the converted speech
    similarityBoost: 0.5,                            // The similarity boost for the converted speech
    modelId:         "eleven_monolingual_v1",       // The ElevenLabs Model ID
    style:           1,                              // The style exaggeration for the converted speech
    speakerBoost:    true                            // The speaker boost for the converted speech
  }).then((res:any) => {
     console.log({res});
});// Send the audio stream directly to the client
    }

   
    const { RealtimeSession } = require('speechmatics');

const API_KEY = 'tBLz13Pahs4QpAMfc9TFPr9nVMmkNP9z';

const session = new RealtimeSession({ apiKey: API_KEY });
const PATH_TO_FILE = `../${audio_file_name}.mp3`;

session.addListener('Error', (error:any) => {
  console.log('session error', error);
});

session.addListener('AddTranscript', (message:any) => {
//   process.stdout.write(message);

book.timestamp = message;


console.log(message)
});

session.addListener('EndOfTranscript', () => {
  process.stdout.write('\n');
});

session
  .start({
    transcription_config: {
      language: 'en',
      operating_point: 'enhanced',
      enable_partials: true,
      max_delay: 2,
    },
    audio_format: { type: 'file' },
  })
  .then(() => {
    //prepare file stream
    const fileStream = fs.createReadStream(PATH_TO_FILE);

    //send it
    fileStream.on('data', (sample:any) => {
      session.sendAudio(sample);
    });

    //end the session
    fileStream.on('end', () => {
      session.stop();
    });

  })
  .catch((error:any) => {
    console.log('error', error.message);
  });


  await book.save();
    // Send the book object as a response after all asynchronous operations have completed
    res.json(book);
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


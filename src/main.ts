
import express  from "express";
import { Request, Response } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
// import path from 'path';

import { authRoutes } from "./routes/auth.routes"
import { UsersRoute } from "./routes/user.routes";
import { text2speechRoutes } from './routes/text2speech.routes'
import {BooksRoutes} from "./routes/books.routes"

import initializeMongoose from './config/mongoose';
import 'dotenv/config';

const app = express();
const port = 5000;

  // Enable CORS
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())


// Set up a route to serve audio files
app.use('/audio', express.static('dist/audio'));
// app.use(express.static('dist'))
// app.use(express.static('public'))


// app.use(express.static(path.join(__dirname, 'dist')));

// // Serve audio files from the 'dist/audio' directory
// app.use('/audio', express.static(path.join(__dirname, 'dist', 'audio')));
initializeMongoose();
authRoutes(app);
UsersRoute(app);
text2speechRoutes(app);
BooksRoutes(app);

//@ts-ignoreconst fs = require('fs');
// import fs from 'fs'
// const { RealtimeSession } = require('speechmatics');

// const API_KEY = 'tBLz13Pahs4QpAMfc9TFPr9nVMmkNP9z';

// const session = new RealtimeSession({ apiKey: API_KEY });
// const PATH_TO_FILE = 'audio2.mp3';

// session.addListener('Error', (error:any) => {
//   console.log('session error', error);
// });

// session.addListener('AddTranscript', (message:any) => {
// //   process.stdout.write(message);

// console.log(message)
// });

// session.addListener('EndOfTranscript', () => {
//   process.stdout.write('\n');
// });

// session
//   .start({
//     transcription_config: {
//       language: 'en',
//       operating_point: 'enhanced',
//       enable_partials: true,
//       max_delay: 2,
//     },
//     audio_format: { type: 'file' },
//   })
//   .then(() => {
//     //prepare file stream
//     const fileStream = fs.createReadStream(PATH_TO_FILE);

//     //send it
//     fileStream.on('data', (sample:any) => {
//       session.sendAudio(sample);
//     });

//     //end the session
//     fileStream.on('end', () => {
//       session.stop();
//     });

//   })
//   .catch((error:any) => {
//     console.log('error', error.message);
//   });

import axios from 'axios';
app.get('/ping', async(_: Request,res:Response) => {
     
  console.log("PINGG")
 let response:any;

  const requestOptions = {
    method: 'POST',
    url: 'https://api.elevenlabs.io/v1/text-to-speech/YpgvQzWEjnAimoQc8qtUG', // Ensure to replace YOUR_VOICE_ID with the actual voice ID
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': '3656ebc4b23ff237c11792a9dfcd2c2c', // This header authenticates your request
    },
    data: {
      text: 'Your text here', // Replace with the text you want to convert to speech
    },
  };
  
  // Make the request using Axios
   response = axios(requestOptions)
    .then(response => {
      // Handle success
      console.log('Success:', response.data);
    })
    .catch(error => {
      // Handle error
      console.error('Error:', error);
    });


    res.send(response.data)
})
app.listen(port, () => {
 


  console.log(`Server is listening on port ${port}`);
});

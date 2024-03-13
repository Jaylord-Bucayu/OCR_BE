
import express  from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

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
app.use('/audio', express.static('audio'));

initializeMongoose();
authRoutes(app);
UsersRoute(app);
text2speechRoutes(app);
BooksRoutes(app);

//@ts-ignoreconst fs = require('fs');
// import fs from 'fs'
// const { RealtimeSession } = require('speechmatics');

// const API_KEY = 'tBLz13Pahs4QpAMfc9TFPr9nVMmkNP9z';

<<<<<<< HEAD
// import { createWorker } from 'tesseract.js';

// (async () => {
//   const worker = await createWorker('eng');
//   const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
//   console.log("hello"+ret.data.text);

//   const paragraph = `The sun was setting behind the mountains, casting a warm orange glow across the sky. Birds were returning to their nests, chirping softly as they settled in for the night. A gentle breeze rustled the leaves of the trees, carrying with it the scent of pine and earth. In the distance, a river flowed lazily, its waters shimmering in the fading light. As twilight descended, the world seemed to quieten, enveloped in a sense of peace and serenity.
//   `;
  
//   const sentenceSplitRegex = /[.!?;:,\n]\s*/;

//   const sentences = paragraph.split(sentenceSplitRegex);

//   sentences.forEach(sentence => {
//       console.log(sentence + '/');
//   });
  
//   await worker.terminate();
// })();


// import WebSocket from 'ws';

// const voiceId = "frA4oJkLjNTYC72eQys1"; // replace with your voice_id
// const model = 'eleven_turbo_v2';
// const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;
// const socket = new WebSocket(wsUrl);

// // 2. Initialize the connection by sending the BOS message
// socket.onopen = function (event:any) {
//     const bosMessage = {
//         "text": " ",
//         "voice_settings": {
//             "stability": 0.5,
//             "similarity_boost": 0.8
//         },
//         "xi_api_key": "d618ae405f2a06faef50c2beefb1971c", // replace with your API key
//     };

//     socket.send(JSON.stringify(bosMessage));

//     // 3. Send the input text message ("Hello World")
//     const textMessage = {
//         "text": "Hello World ",
//         "try_trigger_generation": true,
//     };

//     socket.send(JSON.stringify(textMessage));

//     // 4. Send the EOS message with an empty string
//     const eosMessage = {
//         "text": ""
//     };

//     socket.send(JSON.stringify(eosMessage));
// };

// // 5. Handle server responses
// socket.onmessage = function (event) {
//     const response = JSON.parse(event.data);

//     console.log("Server response:", response);

//     if (response.audio) {
//         // decode and handle the audio data (e.g., play it)
//         const audioChunk = atob(response.audio);  // decode base64
//         console.log("Received audio chunk");
//     } else {
//         console.log("No audio data in the response");
//     }

//     if (response.isFinal) {
//         // the generation is complete
//     }

//     if (response.normalizedAlignment) {
//         // use the alignment info if needed
//     }
// };

// // Handle errors
// socket.onerror = function (error) {
//     console.error(`WebSocket Error: ${error}`);
// };

// // Handle socket closing
// socket.onclose = function (event) {
//     if (event.wasClean) {
//         console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
//     } else {
//         console.warn('Connection died');
//     }
// };

=======
// const session = new RealtimeSession({ apiKey: API_KEY });
// const PATH_TO_FILE = 'audio/output.mp3';
>>>>>>> 19575ac481cd9048ea7d6e3fc22995ef1e2cb3fe

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

app.get('/ping', async(req,res) => {
   res.send({message:"pong"})
})
app.listen(port, () => {
 


  console.log(`Server is listening on port ${port}`);
});
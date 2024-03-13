import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import { PassThrough } from 'stream';


import { createWorker } from 'tesseract.js';

// (async () => {
//   const worker = await createWorker('eng');
//   const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
//   console.log("hello"+ret.data.text);
//   await worker.terminate();
// })();



export async function text2Speech(_: Request, res: Response) {

    
  const url = "https://api.elevenlabs.io/v1/text-to-speech/frA4oJkLjNTYC72eQys1";
  const headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": "d618ae405f2a06faef50c2beefb1971c"
  };

  const worker = await createWorker('eng');
  await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');

  await worker.terminate();


const lyric = `Give me one second to think about it. <break time="1.5s" /> Yes, that would work.`;

  const data = {
    "text": lyric,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.5,
       "speaking_rate":0.5
    }
  };

  try {
    const response = await axios.post(url, data, { headers, responseType: 'stream' });
    
    const passThroughStream = new PassThrough();
    const outputStream = fs.createWriteStream('output.mp3');

   
  

    // Pipe the response stream to both the speaker and the pass-through stream
    response.data.pipe(passThroughStream);
  
    response.data.pipe(outputStream);

  
    // Pipe the pass-through stream directly to the response
    passThroughStream.pipe(res);

     // Generate timestamps for lyrics (replace with your actual timestamp logic)
     const lyrics = lyric.split('\n'); // Split lyrics into lines
     const timestamps = generateTimestamps(lyrics); // Generate timestamps for each line
 
     // Send timestamps along with lyrics to the client
     res.json({ lyrics, timestamps });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
}

function generateTimestamps(lyrics: string[]): number[] {
  const timestamps: number[] = [];
  let currentTime = 0;
  const interval = 1.5 // Interval between each line (in seconds)
  for (let i = 0; i < lyrics.length; i++) {
    timestamps.push(currentTime);
    currentTime += interval;
  }
  return timestamps;
}
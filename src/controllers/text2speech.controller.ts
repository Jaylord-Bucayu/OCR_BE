import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import { PassThrough } from 'stream';
import Speaker from 'speaker';

export async function text2Speech(req: Request, res: Response) {

    
  const url = "https://api.elevenlabs.io/v1/text-to-speech/frA4oJkLjNTYC72eQys1";
  const headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": "d618ae405f2a06faef50c2beefb1971c"
  };
  const data = {
    "text": req.body.text,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.5
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
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
}

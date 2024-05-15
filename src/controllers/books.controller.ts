
import { Request, Response } from "express";
import Books from '../models/book';
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary' 

import { AssemblyAI } from 'assemblyai'

import {uploadImagesToCloudinary,generateCode} from '../utils/index'
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

    const customReq = req as any;

        // Check if user information is attached to the request object
        if (!customReq.auth || !customReq.auth.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }


    // Upload images to Cloudinary
    const uploadedImagesUrls = await uploadImagesToCloudinary(req.files);

    // Create a new book instance with data from the request body
    const data = req.body;
    const book = new Books(data);

    book.code = generateCode(8);

    book.author = customReq.auth.id;
    

    if (!Array.isArray(book.photos) || !Array.isArray(book.page)) {
      throw new Error('book.photos is not an array');
    }

    // Append the uploaded image URLs to the existing photos array
    book.photos.push(...uploadedImagesUrls);

    book.gender = data.gender;

  for (let x = 0; x < uploadedImagesUrls.length; x++) {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(uploadedImagesUrls[x]);
  book.page.push(ret.data.text);
  await worker.terminate();

  console.log("INDEX: " + x);

  const XI_API_KEY = process.env.ELEVEN_LABS_KEY;
  const VOICE_ID:any = {
    "male":process.env.ELEVEN_LABS_VOICE_ID_MALE,
    "female":process.env.ELEVEN_LABS_VOICE_ID_FEMALE
  };
  const textToSpeak = ret.data.text;

 let response: any;
  
 try {
     response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID[data.gender]}`, {
      text: textToSpeak,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }, {
      headers: {
        //'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': XI_API_KEY,
      },
      responseType: 'stream'
    }).then(function (response) {
      console.log({response});

      return response;
    })
    .catch(function (error) {
      console.log({error});
    });


      
   
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

    const transcript = await client.transcripts.transcribe(config);

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
   
    res.status(200).send(book)
  }
}


    
//end for
    await book.save();
    // Send the book object as a response after all asynchronous operations have completed
    res.status(200).send(book)

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

  try {
    const params = req.params;
    const book = await Books.findById(params.id);

    if (!book) {
        return res.status(404).send({ error: 'No book found with the provided ID' });
    }

    res.send(book);
} catch (error) {
    // console.error('Error fetching book:', error);
    res.status(500).send({ error: 'No book found with the provided ID' });
}

}



export async function updateSingleBook(req: Request, res: Response) {

   try {
    const params = req.params;
    const body = req.body;
    const book = await Books.findByIdAndUpdate(params?.id,body);

    res.status(200).send(book)
   } catch (error) {
     console.log(error),
     res.status(500).send({error:"Error updating the book"})
   }

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


export async function getSingleBookPage(req: Request, res: Response) {
  const params = req.params;
  const query = req.query;

  const page = await Books.findById(params.id);

  if (!page) {
      return res.status(404).send('Page not found');
  }

  // Ensure that query.page is a number or default to 0
  let audioIndex: number;

  //@ts-ignore
  audioIndex = parseInt(query.page) - 1;
  
  // Now you can increment audioIndex safely


  const pageData:any = page.page || undefined;

  const single_page = {
      timestamp: page.timestamp?.[audioIndex],
      title: page.title,
      description: page.description,
      photos: page.photos?.[audioIndex],
      audio: page.audio?.[audioIndex],
      page:pageData[audioIndex] || '',
      pageNo:audioIndex + 1,
      totalPageNo:page.timestamp.length || page.audio?.length,
      gender:page.gender
  };

  res.send(single_page);
}

export async function getSingleBookPages(req: Request, res: Response) {
  try {
      const params = req.params;
      const book = await Books.findById(params.id);

      if (!book) {
          return res.status(404).send({ error: 'No book found with the provided ID' });
      }
    
      if (!Array.isArray(book.page)) {
        return res.status(500).send({ error: 'Invalid page data in the book' });
    }

      // Transform book pages into the desired structure
      const pages = book?.page.map((page:any, index:any) => {
          return {
              id: index + 1,
              pageType: page.pageType || 'Page', // Assuming default pageType is 'Page'
              points: page.points || 20, // Assuming default points is 20
              pageNumber: page.pageNumber || index + 1, // Assuming default pageNumber is the index + 1
              pageText: page,
              pagePhoto: book.photos && book.photos[index] ? book.photos[index] : '/assets/images/default_photo.png', // Assuming default photo path if photo is not provided
              gender: book.gender
          };
      });

      res.send(pages);
  } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
}

export async function deleteSingleBook(req: Request, res: Response) {
  const params = req.params;

  try {
    const deletedPage = await Books.findByIdAndDelete(params.id);

    if (!deletedPage) {
      return res.status(404).send('Page not found');
    }

    res.status(200).send('Page deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

export async function editSinglePage(req: Request, res: Response) {
  try {
      const { bookId, pageId }:any = req.params;
      const { page } = req.body;

      console.log(req.params)

      // Retrieve the book
      const book = await Books.findById(bookId);

      if (!book) {
          return res.status(404).send({ error: 'No book found with the provided ID' });
      }

      // Ensure book.page is an array
      if (!Array.isArray(book.page)) {
          return res.status(500).send({ error: 'Invalid page data in the book' });
      }

      // Find the page to edit
      const pageToEdit = book.page[pageId - 1]; // Assuming pageId is 1-based index
     
      console.log({pageToEdit})
      if (!pageToEdit) {
          return res.status(404).send({ error: 'No page found with the provided ID' });
      }

      // Update the page properties
      if (page) {
        book.page[pageId - 1] = page;
       

        const XI_API_KEY = process.env.ELEVEN_LABS_KEY;
        const VOICE_ID:any = {
          "male":process.env.ELEVEN_LABS_VOICE_ID_MALE,
          "female":process.env.ELEVEN_LABS_VOICE_ID_FEMALE
        };
        const textToSpeak = page;
      
       let response: any;
     
    
       try {
           response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID[book?.gender || 'female']}`, {
            text: textToSpeak,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          }, {
            headers: {
              //'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': XI_API_KEY,
            },
            responseType: 'stream'
          }).then(function (response) {
            console.log({response});
      
            return response;
          })
          .catch(function (error) {
            console.log({error});
          });
      
          console.log(response.data)
            
         
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
          book.audio[pageId - 1] = result.secure_url;
      
          await book.save();
      
          const client = new AssemblyAI({
            apiKey: "3b7a960b7d304bef9b2ad6df971d6090"
          });
      
          const audioUrl = result.secure_url;
          const config = {
            audio_url: audioUrl
          };
      
          const transcript = await client.transcripts.transcribe(config);
      
          if (!book.timestamp) {
            book.timestamp = [];
          }
      
          if (transcript.words) {
            console.log("PUSHED");
            book.timestamp[pageId - 1] = transcript.words;
          }
      
          await book.save();
      
         
      
        } catch (error) {
          console.error('Error processing audio:', error);
         
          res.status(200).send(book)
        }

      }
      // if (pagePhoto) {
      //     pageToEdit.pagePhoto = pagePhoto;
      // }

      // Save the updated book
      await book.save();

      res.status(200).send({ message: 'Page updated successfully', updatedPage: pageToEdit });
  } catch (error) {
      console.error('Error editing page:', error);
      res.status(500).send({ error: 'Internal server error' });
  }
}

export async function deleteSinglePage(req: Request, res: Response) {
  try {
    const { bookId, pageId }: any = req.params;

    // Retrieve the book
    const book = await Books.findById(bookId);

    if (!book) {
      return res.status(404).send({ error: 'No book found with the provided ID' });
    }

    // Ensure book.page is an array
    if (!Array.isArray(book.page)) {
      return res.status(500).send({ error: 'Invalid page data in the book' });
    }

    // Find the page to delete
    const deletedPage = book.page.splice(pageId - 1, 1)[0]; // Assuming pageId is 1-based index

    if (!deletedPage) {
      return res.status(404).send({ error: 'No page found with the provided ID' });
    }

    // Update audio and timestamp arrays accordingly
    if (Array.isArray(book.audio)) {
      book.audio.splice(pageId - 1, 1);
    }
    if (Array.isArray(book.timestamp)) {
      book.timestamp.splice(pageId - 1, 1);
    }

    // Save the updated book
    await book.save();

    res.status(200).send({ message: 'Page deleted successfully', deletedPage });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
}


export async function addSinglePage(req: Request, res: Response) {
  try {
    const { bookId }: any = req.params;
    // const { gender } = req.body;

  

    // Retrieve the book
    const book = await Books.findById(bookId);



    if (!book) {
      return res.status(404).send({ error: 'No book found with the provided ID' });
    }

    // Ensure book.page is an array
    if (!Array.isArray(book.page) || !Array.isArray(book.photos)) {
      return res.status(500).send({ error: 'Invalid page data in the book' });
    }

    // Upload images to Cloudinary
    const uploadedImagesUrls = await uploadImagesToCloudinary(req.files);

    // Process each uploaded image
    for (let i = 0; i < uploadedImagesUrls.length; i++) {
      const imageUrl = uploadedImagesUrls[i];

      // Perform OCR to extract text from the image

      const worker = await createWorker('eng');

      const { data: { text } } = await worker.recognize(imageUrl);
      book.page.push(text);
      await worker.terminate();

      // Push the extracted text and image URL into the book
      book.photos.push(imageUrl);
      

      // Text to speech and upload audio process
      const XI_API_KEY = process.env.ELEVEN_LABS_KEY;
      const VOICE_ID: any = {
        "male": process.env.ELEVEN_LABS_VOICE_ID_MALE,
        "female": process.env.ELEVEN_LABS_VOICE_ID_FEMALE
      };

      let response: any;

      try {
        response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID[book?.gender || 'female']}`, {
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': XI_API_KEY,
          },
          responseType: 'stream'
        });

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

        const transcript = await client.transcripts.transcribe(config);

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
        return res.status(500).send({ error: 'Error processing audio' });
      }
    }

    res.status(200).send({ message: 'Pages added successfully' });
  } catch (error) {
    console.error('Error adding pages:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
}


//teacher
export async function getAllBooksPublishedByUser(req: Request, res: Response) {
  try {
    
    const customReq = req as any;

    // Check if user information is attached to the request object
 
      // Fetch all books published by the user
      const publishedBooks = await Books.find({ author: customReq?.auth.id });

      res.json(publishedBooks);
  } catch (error) {
      console.error('Error fetching books published by user:', error);
      res.status(500).send('Error fetching books published by user');
  }
}




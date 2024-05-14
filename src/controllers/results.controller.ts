import { Request, Response } from "express";
import Results from '../models/results'; // Import the Results model
// import User from '../models/user';
import Books from '../models/book';

export async function saveCompletedReading(req: Request, res: Response) {
    try {
        const { studentId, bookId, score, timeSpent } = req.body;

        // Check if the book exists
        const book = await Books.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the attempt limit has been reached
        if (book.attempt !== undefined) {
            const result = await Results.findOne({ studentId, bookId });
            if (result) {
                if (result.attempts.length >= book.attempt) {
                    return res.status(400).json({ message: "Your attempt limit has been reached" });
                }
                // If a result exists, add a new attempt
                result.attempts.push({ score, timeSpent, date: Date.now() });

                await result.save();


            } else {
                // If no result exists, create a new one with the attempt
                const newResult = new Results({
                    studentId,
                    bookId,
                    attempts: [{ score, timeSpent, date: Date.now() }]
                });
                await newResult.save();

               return res.status(201).json(newResult);
            }

          
            res.status(201).json(result);
        } else {
            return res.status(500).json({ message: "Attempt limit is not defined for this book" });
        }
    } catch (error) {
        console.error('Error saving completed reading:', error);
        res.status(500).send('Error saving completed reading');
    }
}


export async function getCompletedReading(_: Request, res: Response) {
    try {
        const results = await Results.find();
        res.json(results);
    } catch (error) {
        console.error('Error fetching completed readings:', error);
        res.status(500).send('Error fetching completed readings');
    }
}

export async function getCompletedReadingById(req: Request, res: Response) {
    try {
        const result = await Results.findById(req.params.id);
        if (!result) {
            return res.status(404).send('Reading result not found');
        }
        res.json(result);
    } catch (error) {
        console.error('Error fetching completed reading by ID:', error);
        res.status(500).send('Error fetching completed reading by ID');
    }
}

export async function updateCompletedReading(req: Request, res: Response) {
    try {
        const result = await Results.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!result) {
            return res.status(404).send('Reading result not found');
        }
        res.json(result);
    } catch (error) {
        console.error('Error updating completed reading:', error);
        res.status(500).send('Error updating completed reading');
    }
}

export async function deleteCompletedReading(req: Request, res: Response) {
    try {
        const result = await Results.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send('Reading result not found');
        }
        res.send('Reading result deleted successfully');
    } catch (error) {
        console.error('Error deleting completed reading:', error);
        res.status(500).send('Error deleting completed reading');
    }
}



//student
export async function getAllStudentEnrolledBooks(req: Request, res: Response) {
    try {
        const { bookId } = req.body;

        // const customReq = req as any;

        // // Check if user information is attached to the request object
        // if (!customReq.auth || !customReq.auth.id) {
        //   return res.status(401).json({ message: "Unauthorized" });
        // }

        const books = await Books.findById(bookId);
        
        if(!books || !books.isPublic) return res.status(500).send({message:"Book not found"});
       
  
        // Get the enrolled books for the student
        const enrolledBooks = await Results.find({ bookId }).populate('bookId').populate('studentId');
  
        res.status(200).json(enrolledBooks);
    } catch (error) {
        console.error('Error fetching enrolled books:', error);
        res.status(500).send('Error fetching enrolled books');
    }
  }

  //get books attempt per student 

  export async function getStudentsAttemptsPerBook(req: Request, res: Response) {
    try {
        const { bookId, studentId } = req.body;
        const { page } = req.query;

        const books = await Books.findById(bookId);

        if (!books || !books.isPublic) {
            return res.status(404).send({ message: "Book not found" });
        }

        const enrolledBooks = await Results.findOne({ bookId, studentId });

        if (!enrolledBooks || !enrolledBooks.attempts || enrolledBooks.attempts.length === 0) {
            return res.status(404).send({ message: "Attempts not found" });
        }

        if (!page) {
            return res.status(200).json(enrolledBooks); // Return all attempts if page is not provided
        }

        let attemptIndex: number;

        if (typeof page === 'string') {
            attemptIndex = parseInt(page) - 1;
        } else {
            return res.status(404).send({ message: "Page not found" });
        }

        if (isNaN(attemptIndex) || attemptIndex < 0 || attemptIndex >= enrolledBooks.attempts.length) {
            return res.status(400).send({ message: "Invalid attempt number" });
        }

        const attempt = {
            final_score:enrolledBooks.final_score,
            bookId:enrolledBooks.bookId,
            _id:enrolledBooks.id,
            studentId:enrolledBooks.studentId,
            attempts:enrolledBooks.attempts[attemptIndex]
        }

        res.status(200).json(attempt);
    } catch (error) {
        console.error('Error fetching enrolled books:', error);
        res.status(500).send('Error fetching enrolled books');
    }
}

  export async function scoreReading(req: Request, res: Response){
    try {
        const {final_score,studentId,bookId} = req.body;

 

        if(final_score == undefined || final_score == null) return res.status(404).send({message:"Please indicate the score"});
        
        const result = await Results.findOne({studentId,bookId});
        if (!result) {
            return res.status(404).send('Reading result not found');
        }

        result.final_score = final_score;
        res.json(result);
    } catch (error) {
        console.error('Error updating completed reading:', error);
        res.status(500).send('Error updating completed reading');
    }
  }
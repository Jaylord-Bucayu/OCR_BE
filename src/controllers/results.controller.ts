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
            } else {
                // If no result exists, create a new one with the attempt
                const newResult = new Results({
                    studentId,
                    bookId,
                    attempts: [{ score, timeSpent, date: Date.now() }]
                });
                await newResult.save();
            }

            await result.save();
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
  
        // Get the enrolled books for the student
        const enrolledBooks = await Results.find({ bookId }).populate('bookId').populate('studentId');
  
        res.status(200).json(enrolledBooks);
    } catch (error) {
        console.error('Error fetching enrolled books:', error);
        res.status(500).send('Error fetching enrolled books');
    }
  }


  export async function scoreReading(req: Request, res: Response){
    try {
        const {score} = req.body;

        if(!score) return res.status(404).send({message:"Please indicate the score"});
        
        const result = await Results.findByIdAndUpdate(req.params.id, {final_score:score}, { new: true });
        if (!result) {
            return res.status(404).send('Reading result not found');
        }
        res.json(result);
    } catch (error) {
        console.error('Error updating completed reading:', error);
        res.status(500).send('Error updating completed reading');
    }
  }
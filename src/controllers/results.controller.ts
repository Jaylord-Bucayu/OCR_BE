import { Request, Response } from "express";
import Results from '../models/results'; // Import the Results model
// import User from '../models/user';

export async function saveCompletedReading(req: Request, res: Response) {
    try {
        const { studentId, bookId, score, timeSpent } = req.body;
        
        // Find the result for this student and book
        let result = await Results.findOne({ studentId, bookId });

        if (result) {
            // If a result exists, add a new attempt
            result.attempts.push({ score, timeSpent, date: Date.now() });
        } else {
            // If no result exists, create a new one with the attempt
            result = new Results({
                studentId,
                bookId,
                attempts: [{ score, timeSpent, date: Date.now() }]
            });
        }

        await result.save();

        res.status(201).json(result);
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

import { Request, Response } from "express";
import EnrolledBook from '../models/enrolled'; // Correct the model import path
import Book from '../models/book'; // Assuming 'Books' is the Book model

export async function getAllEnrolledBooks(req: Request, res: Response) {
    try {
        // Fetch all enrolled books for the given studentId
        const enrolledBooks = await EnrolledBook.find({ studentId: req.body.id })
            .populate("bookId")
            .populate("studentId");
        res.json(enrolledBooks);
    } catch (error) {
        console.error('Error fetching enrolled books:', error);
        res.status(500).send('Error fetching enrolled books');
    }
}

export async function enrollBookWithCode(req: Request, res: Response) {
    try {
        const { studentId, code } = req.body;

        // Verify the code
        const isValidCode = await Book.findOne({ code });
        if (!isValidCode) {
            return res.status(401).json({ message: "The course code is not valid" });
        }

        // Check if the student is already enrolled in the book
        const existingEnrollment = await EnrolledBook.findOne({ studentId, bookId: isValidCode.id });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Student already enrolled in this book' });
        }

        // Create a new enrollment
        const enrollment = new EnrolledBook({
            studentId,
            bookId: isValidCode.id,
            enrollmentDate: new Date(),
            completionStatus: 'not_started' // Assuming the default completion status is 'not_started'
        });

        // Save the enrollment to the database
        await enrollment.save();

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Error enrolling book with code:', error);
        res.status(500).send('Error enrolling book with code');
    }
}


export async function unenrollBook(req: Request, res: Response) {
    try {
        const { studentId, bookId } = req.body;

        // Find the enrollment record
        const enrollment = await EnrolledBook.findOne({ studentId, bookId });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment record not found' });
        }

        // Delete the enrollment record
        await enrollment.deleteOne();

        res.status(200).json({ message: 'Successfully unenrolled from the book' });
    } catch (error) {
        console.error('Error unenrolling from the book:', error);
        res.status(500).send('Error unenrolling from the book');
    }
}

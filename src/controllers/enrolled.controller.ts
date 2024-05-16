import { Request, Response } from "express";
import EnrolledBook from "../models/enrolled"; // Correct the model import path
import Book from "../models/book"; // Assuming 'Books' is the Book model
import Results from "../models/results";

export async function getAllEnrolledBooks(req: Request, res: Response) {
  try {

    const { id } = req.body;

    const studentId = id;

    // Fetch all enrolled books for the given studentId
    const enrolledBooks = await EnrolledBook.find({ studentId })
    .populate({
        path: 'bookId',
        match: { isPublic: true }, // Filter books where isPublic is true
    })
    .populate('studentId');

    const filteredEnrolledBooks = enrolledBooks.filter(item => item.bookId !== null);

    res.json(filteredEnrolledBooks);
  } catch (error) {
    console.error("Error fetching enrolled books:", error);
    res.status(500).send("Error fetching enrolled books");
  }
}

export async function enrollBookWithCode(req: Request, res: Response) {
  try {
    const { code } = req.body;

    const customReq = req as any;

    // Check if user information is attached to the request object
    if (!customReq.auth || !customReq.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the code
    const isValidCode = await Book.findOne({ code });
    if (!isValidCode) {
      return res.status(401).json({ message: "The course code is not valid" });
    }

    // Check if the student is already enrolled in the book
    const existingEnrollment = await EnrolledBook.findOne({
      studentId: customReq.auth.id,
      bookId: isValidCode.id,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this book" });
    }

    // Create a new enrollment
    const enrollment = new EnrolledBook({
      studentId: customReq.auth.id,
      bookId: isValidCode.id,
      enrollmentDate: new Date(),
      completionStatus: "not_started", // Assuming the default completion status is 'not_started'
    });

    // Save the enrollment to the database
    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (error) {
    console.error("Error enrolling book with code:", error);
    res.status(500).send("Error enrolling book with code");
  }
}

export async function unenrollBook(req: Request, res: Response) {
  try {
    const {  code } = req.body;


    const isValidCode = await Book.findOne({ code });
    if (!isValidCode) {
      return res.status(401).json({ message: "The course code is not valid" });
    }

    const customReq = req as any;

    // Check if user information is attached to the request object
    if (!customReq.auth || !customReq.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the enrollment record
    const enrollment = await EnrolledBook.findOne({ studentId: customReq.auth.id, bookId:isValidCode.id });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    // Delete the enrollment record
    await enrollment.deleteOne();

    res.status(200).json({ message: "Successfully unenrolled from the book" });
  } catch (error) {
    console.error("Error unenrolling from the book:", error);
    res.status(500).send("Error unenrolling from the book");
  }
}


//unenroll a student 
export async function unenrollAStudent(req: Request, res: Response) {
  try {
    const {  code,studentId } = req.body;


    const isValidCode = await Book.findOne({ code });
    if (!isValidCode) {
      return res.status(401).json({ message: "The course code is not valid" });
    }

  

    // Find the enrollment record
    const enrollment = await EnrolledBook.findOne({ studentId, bookId:isValidCode.id });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    // Delete the enrollment record
    await enrollment.deleteOne();

    res.status(200).json({ message: "Successfully unenrolled from the book" });
  } catch (error) {
    console.error("Error unenrolling from the book:", error);
    res.status(500).send("Error unenrolling from the book");
  }
}

export async function getStudentEnrolledBook(req: Request, res: Response) {
  try {
    const { bookId } = req.body;

    const customReq = req as any;

    // Check if user information is attached to the request object
    if (!customReq.auth || !customReq.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const existingEnrollment = await Results.findOne({
      studentId: customReq.auth.id,
      bookId,
    });

    console.log(customReq.auth.id)
    res.status(200).json(existingEnrollment);
  } catch (error) {
    console.error("Error fetching the book:", error);
    res.status(500).send("Error fetching the book");
  }
}


export async function getStudentAllEnrolledBook(req: Request, res: Response) {
  try {
    const { bookId } = req.body;

    const customReq = req as any;

    // Check if user information is attached to the request object
    if (!customReq.auth || !customReq.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch all enrolled students for the given book ID
    const enrollments = await EnrolledBook.find({ bookId })
      .populate("studentId")
      .populate("bookId");

    // Fetch all results for the given book ID
    const results = await Results.find({ bookId })
      .populate("studentId")
      .populate("bookId");

    // Create a map of results by student ID
    const resultsMap = new Map();
    results.forEach((result:any) => {
      resultsMap.set(result.studentId._id.toString(), result);
    });

    // Combine enrollments and results
    const combinedData = enrollments.map(enrollment => {
      const studentId = enrollment.studentId._id.toString();
      const result = resultsMap.get(studentId);

      return {
        ...enrollment.toObject(),
        attempts: result ? result.attempts : [],
        final_score: result ? result.final_score : 0,
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching the book:", error);
    res.status(500).send("Error fetching the book");
  }
}




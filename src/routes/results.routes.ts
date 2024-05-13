import { Application } from "express";
import {
  saveCompletedReading,
  getCompletedReading,
  getCompletedReadingById,
  updateCompletedReading,
  deleteCompletedReading,
  getAllStudentEnrolledBooks,
} from "../controllers/results.controller";

export function ReadingRoute(app: Application) {
  /**
   * Get all completed readings
   **/
  app.get("/readings", getCompletedReading);

  /**
   * Get a specific completed reading by ID
   **/
  app.get("/readings/:id", getCompletedReadingById);

  /**
   * Update a completed reading
   **/
  app.patch("/readings/:id", updateCompletedReading);

  /**
   * Delete a completed reading
   **/
  app.delete("/readings/:id", deleteCompletedReading);

  /**
   * Create a new completed reading
   **/
  app.post("/readings", saveCompletedReading);

  app.get("/books/students/enrolled", getAllStudentEnrolledBooks);
}

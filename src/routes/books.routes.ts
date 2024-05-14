import { Application } from "express";
import middleware from "../middleware/auth"
import {
    createBook,
    getAllBook,
    getSingleBook,
    updateSingleBook,
    userSubscription,
    getSingleBookPage,
    getSingleBookPages,
    editSinglePage,
    addSinglePage,
    deleteSinglePage,
    deleteSingleBook,
    getAllBooksPublishedByUser,
    

} from "../controllers/books.controller";


import { getAllEnrolledBooks,enrollBookWithCode,unenrollBook ,getStudentEnrolledBook,} from "../controllers/enrolled.controller";

import {getStudentsAttemptsPerBook} from "../controllers/results.controller"

export function BooksRoutes(app: Application) {

     /**
     create book
     **/

     app.get("/book",
     getAllBook);

     
    app.post("/book/create",middleware,
    createBook
    );
    

    app.patch("/book/:bookId/single/edit/page/:pageId",editSinglePage)
    app.post("/book/:bookId/single/add/page",addSinglePage)
    app.delete("/book/:bookId/single/delete/page/:pageId",deleteSinglePage)
    

    app.get("/book/:id",
    getSingleBook
    );


    app.delete("/book/:id",
    deleteSingleBook)

    app.patch("/book/:id",
    updateSingleBook)

 

    app.get("/book/:id/get",getSingleBookPage)
    app.get("/book/:id/single/page",getSingleBookPages)

    app.get("/book/subscription",userSubscription)


    app.post("/books/get/enrolled",getAllEnrolledBooks)

    app.post("/books/enrolled",middleware,enrollBookWithCode)


    //teacher

    app.get("/books/published", middleware, getAllBooksPublishedByUser)

    //students
    app.post("/books/unenroll", middleware,unenrollBook)
    app.post("/books/students/attempts",middleware,getStudentEnrolledBook)

    app.post("/books/per-student/attempts",middleware,getStudentsAttemptsPerBook)
    
    
}
import { Application } from "express";

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
    deleteSingleBook
} from "../controllers/books.controller";


import { getAllEnrolledBooks,enrollBookWithCode } from "../controllers/enrolled.controller";

export function BooksRoutes(app: Application) {

     /**
     create book
     **/

     app.get("/book",
     getAllBook);

     
    app.post("/book/create",
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


    app.get("/books/enrolled",getAllEnrolledBooks)

    app.post("/books/enrolled",enrollBookWithCode)
    
    
}
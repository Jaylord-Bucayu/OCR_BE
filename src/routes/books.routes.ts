import { Application } from "express";

import {
    createBook,
    getAllBook,
    getSingleBook,
    updateSingleBook,
    userSubscription,
    getSingleBookPage,
    getSingleBookPages,
    editSinglePage
} from "../controllers/books.controller";

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
    

    app.get("/book/:id",
    getSingleBook
    );


    app.patch("/book/:id",
    updateSingleBook)

 

    app.get("/book/:id/get",getSingleBookPage)
    app.get("/book/:id/single/page",getSingleBookPages)

    app.get("/book/subscription",userSubscription)

    
    
}
import { Application } from "express";

import {
    createBook,
    getAllBook,
    getSingleBook,
    updateSingleBook,
    userSubscription
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
    

    app.get("/book/:id",
    getSingleBook
    );


    app.patch("/book/:id",
    updateSingleBook)

    app.get("/book/subscription",userSubscription)
    
}
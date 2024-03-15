import { Application } from "express";

import {
    createBook,
    getAllBook,
    getSingleBook,
    updateSingleBook
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
    
}
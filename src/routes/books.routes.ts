import { Application } from "express";

import {
    createBook,
    getSingleBook,
    updateSingleBook
} from "../controllers/books.controller";

export function BooksRoutes(app: Application) {

     /**
     create book
     **/
    app.post("/book/create",
    createBook
    );
    

    app.get("/book/:id",
    getSingleBook
    );


    app.patch("/book/:id",
    updateSingleBook)
    
}
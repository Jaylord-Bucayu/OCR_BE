import { Application } from "express";

import {
    createBook,
    getAllBook,
    getSingleBook,
    updateSingleBook,
    userSubscription,
    getSingleBookPage,
    getSingleBookPages
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


    app.get("/book/:id/get",getSingleBookPage)
    app.get("/book/:id/single/page",getSingleBookPages)

    app.get("/book/subscription",userSubscription)
    
}
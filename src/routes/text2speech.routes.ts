import { Application } from "express";

import {
    text2Speech
} from "../controllers/text2speech.controller";

export function text2speechRoutes(app: Application) {

     /**
    * sign user
    **/
    app.post("/text",
    text2Speech
);

    
}
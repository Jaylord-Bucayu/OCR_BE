import { Application } from "express";

import {
    signUserInWithEmailPassword
} from "../controllers/auth.controller";

export function authRoutes(app: Application) {

     /**
    * sign user
    **/
    app.post("/login",
    signUserInWithEmailPassword
);

    
}
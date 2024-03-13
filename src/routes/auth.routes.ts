import { Application } from "express";

import {
    signUserInWithEmailPassword ,signUserUpWithEmailPassword
} from "../controllers/auth.controller";

export function authRoutes(app: Application) {

     /**
    * sign user
    **/
    app.post("/login",
    signUserInWithEmailPassword
);


app.post("/register",
signUserUpWithEmailPassword
);

    
}
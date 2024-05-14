import { Application } from "express";

import {
    signUserInWithEmailPassword ,signUserUpWithEmailPassword
,deleteUser, resetPassword} from "../controllers/auth.controller";
import middleware from "../middleware/auth";

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

app.delete('/students/:userId',middleware, deleteUser);


app.patch('/reset-password',resetPassword)
}
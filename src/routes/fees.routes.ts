import { Application } from "express";

import { getFeesList , getFeesById, createFee } from "../controllers/fees.controller";
import auth from '../middleware/auth';
export function FeesRoute(app: Application) {

     /**
    * payments list
    **/
    app.get("/fees",
    auth,
    getFeesList
    );

     /**
    * payments show
    **/
     app.get("/fees/:id",
     getFeesById
     );


     /**
    * payments create
    **/
     app.post("/fees/create",
     createFee
     );


   
  




    
}
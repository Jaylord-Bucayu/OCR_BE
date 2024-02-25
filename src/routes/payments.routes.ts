import { Application } from "express";

import { getPaymentsList , getPaymentsById, createPayment } from "../controllers/payments.controller";

export function PaymentsRoute(app: Application) {

     /**
    * payments list
    **/
    app.get("/payments",
    getPaymentsList
    );

     /**
    * payments show
    **/
     app.get("/payments/:id",
     getPaymentsById
     );


     /**
    * payments create
    **/
     app.post("/payments/create",
     createPayment
     );

    
}
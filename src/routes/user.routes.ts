import { Application } from "express";

import { editStudent,getStudentsList , getStudentById, getUsersList,createStudent, addStudentParticular } from "../controllers/user.controller";
import { getStudentFees } from '../controllers/fees.controller';

export function UsersRoute(app: Application) {

     /**
    * payments list
    **/
    app.get("/users",
    getUsersList
    );

     /**
    * payments show
    **/
     app.get("/users/show/:id",
     getStudentById
     );

     /**
      *create User *
      **/

      app.post("/students/create",
      createStudent
      )


      app.get("/students",
      getStudentsList)

      app.get("/students/:id",getStudentById)

      app.patch("/students/:id",editStudent)

      app.get("/students/fees/:id",  getStudentFees)


      app.post('/students/particulars/create/:id',addStudentParticular)



    
}
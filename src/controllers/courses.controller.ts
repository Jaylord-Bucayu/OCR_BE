
import { Request, Response } from "express";
import Courses from '../models/courses';

// import {generateRandomString} from '../utils/index'

export async function getList(req:Request, res: Response) {

  const data = req.body;
  const payment = await Courses.find(data)
  //.populate('student').populate('parent').populate('fee');
  res.send(payment)

}


export async function getById(req:Request, res: Response) {

   const params = req.params;
   const payment = await Courses.findById(params.id)
   res.send(payment)
 
}

export async function update(req:Request, res: Response){

   const {id} = req.params;
   const body = req.body;

   const course = await Courses.findByIdAndUpdate(id,body)
   
   if(!course) return res.status(500).send({message:"Course is not found"});

   res.status(200).send({message:"Course updated successfully"})

}


//  export async function create(req:Request, res: Response) { 

//     try {
//         const data = req.body;
//     const payment = new Courses(data);
//     payment.teacher = req?.auth.id;
//     payment.code = generateRandomString(6);


//     await payment.save();
//     res.send(payment)
//     } catch (error) {
         
//         return res.status(500).send(error)
//     }

// }


// export async function enroll(req:Request, res:Response){
    
//     const {code} = req.body
    
//     const course = await Courses.findOne({code})

//     if(!course) return res.send(500).send({message:"Course code not found"});
        
//     course?.students.push(req.auth.id);

//     await course.save();
    
//     const data = {message:"You successfully enrolled"}

//      res.send(200).send(data);

// }

// export async getAllStudentInCourse(req: Request, res: Response){


// }


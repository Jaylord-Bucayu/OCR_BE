
import { Request, Response } from "express";
import Fee from '../models/fees';
import User from '../models/user';

export async function getStudentClearanceList(req: Request, res: Response) {

    const params = req.params

    //get student with parent iid

    const student = await User.findOne({parent:params.id})

   if(student){
     await Fee.find({student:student.id});

    return res.send('added')
   }

   res.send('empty')

}



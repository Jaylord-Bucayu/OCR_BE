
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
// import XLSX  from 'xlsx';
// import csv from 'csv-parser';

//MODELS
import User from '../models/user';
import Auth from '../models/auth'
import Fee from '../models/fees';
import { UploadedFile } from 'express-fileupload';

//UTILS
 import { parseFile } from '../utils/index'

export async function getStudentsList(_:Request, res: Response) {
 //const data = req.body;

 
 const users = await Auth.find({ 'role': 'student' }).populate('user')
res.send(users) 
   

}


export async function getStudentById(req:Request, res: Response) {

 const params = req.params

  const user = await Auth.findById(params.id).populate('user');
  res.send(user)
 
 }





export async function createUser(req:Request, res: Response) {
    const data = req.body;
 
    try {

      //create student
        const auth = new Auth({
            email: data.email,
            username: data.username,
            mobile: data.mobile,
            role: 'student',
            password: bcrypt.hashSync(data.password, 10),
        });

        await auth.save();

        const user = new User({
            _id: auth.id,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname
        });

        await user.save();

        console.log('hello')
        //create parent
        const parent_auth = new Auth({
            email: data.parent.email,
            mobile: data.parent.mobile,
            role: 'parent',
            password: bcrypt.hashSync(data.parent.email, 10),
        });

        await parent_auth.save();

        const parent_user = new User({
            _id: auth.id,
            firstname: data.parent.firstname,
            middlename: data.parent.middlename,
            lastname: data.parent.lastname
        });

        await parent_user.save();




        return res.send('user created')


    } catch (error) {

        return res.send(error);
        
    }


}


export async function createUserFromFile(req: Request, res: Response) {
  try {
      const files = req.files?.file as UploadedFile;
      if (!files) {
          return res.status(400).send('No file uploaded');
      }

      const fileList = Array.isArray(files) ? files : [files]; // Convert to array if it's not already

      for (const file of fileList) {
          const data: any = await parseFile(file);
          for (const userData of data) {

            console.log({userData})
              // Assuming the structure of userData matches the expected format
              const auth = new Auth({
                  email: userData.email,
                  mobile: userData.mobile,
                  role: 'student',
                  password: bcrypt.hashSync(userData.student_id.toString(), 10),
              });
              await auth.save();

              const user = new User({
                  _id: auth.id,
                  firstname: userData.firstname,
                  middlename: userData.middlename,
                  lastname: userData.lastname,
                  email: userData.email,
                  data: {
                    student_id : userData.student_id
                  }
              });
              await user.save();
          }
      }

      return res.send('Users created successfully');
  } catch (error) {
      console.error('Error creating users:', error);
      return res.status(500).send({message:error.message});
  }
}


export async function createStudent(req:Request, res: Response) {
  const data = req.body;

  try {

    //create student
      const auth = new Auth({
          email: data.email,
          username: data.username,
          mobile: data.mobile,
          role: 'student',
          password: bcrypt.hashSync(data.birthdate, 10),
      });

      await auth.save();

      const user = new User({
          _id: auth.id,
          firstname: data.firstname,
          middlename: data.middlename,
          lastname: data.lastname,
          birthdate:data.birthdate,
          gender:data.gender,
          section:data.section,
          studentId: data.studentId
      });

      await user.save();

     
      //create parent
      const parent_auth = new Auth({
          email: data.parent.email,
          mobile: data.parent.mobile,
          role: 'parent',
          password: bcrypt.hashSync(data.parent.email, 10),
      });

      await parent_auth.save();

      const parent_user = new User({
          _id: parent_auth.id,
          firstname: data.parent.firstname,
          middlename: data.parent.middlename,
          lastname: data.parent.lastname
      });

      await parent_user.save();

      user.parent = parent_auth.id;
      await user.save();

      return res.send('user created')


  } catch (error) {

      return res.send(error);
      
  }


}

export async function editStudent(req: Request, res: Response) {
  try {
      const data = req.body;
      const params = req.params;

      console.log({ data, params });

      // Update user information
      await User.findByIdAndUpdate(params.id, { $set: { ...data } }, { upsert: true });

      // Update authentication information if exists
      const auth = await Auth.findById(data.id);
      if (auth) {
          auth.mobile = data.mobile || auth.mobile;
          auth.email = data.email || auth.email;
          await auth.save();
      }

      res.send('Profile updated successfully');
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Error updating profile');
  }
}

export async function getUsersList(_:Request, res: Response) {

  const users = await User.find();

   res.send(users)

}




export async function addStudentParticular(req:Request,res:Response) {
  const params = req.params;
  const data = req.body;

  const addedFee = new Fee(data);
  addedFee.student = params.id!;

  await addedFee.save();

  res.send('fee added');


}

 export async function getParentsList(_:Request, res: Response) {

    const data = [
     {
       "id": 1,
       "title": "Spanish"
     },
     {
       "id": 2,
       "title": "English"
     },
     {
       "id": 3,
       "title": "German"
     }
   ]
 
     res.send(data)
 
 }

 export async function getParentById(_:Request, res: Response) {

    const data = 
     {
       "id": 1,
       "title": "Spanish"
     }
     
 
     res.send(data)
 
 }
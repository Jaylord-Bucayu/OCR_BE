
import { Request, Response } from "express";
import Section from '../models/section';
import User from '../models/user';
import Fee from '../models/fees';
import Mailer from '../config/mailer'

export async function getSectionsList(req: Request, res: Response) {

    const data = req.body;
    const sections = await Section.find(data);

    res.send(sections)

}

export async function getSection(req: Request, res: Response) {


    const params = req.params
    const sections = await Section.findById(params.id);

    res.send(sections)

}

export async function editSection(req: Request, res: Response) {

    const data = req.body;
    const params = req.params
    const sections = await Section.findByIdAndUpdate(params.id, {
        $set: {
            ...data
        },
        }, { upsert: true });
   
    res.send(sections)

}




export async function createSection(req: Request, res: Response) {

    const data = req.body;
    const sections = new Section(data);

    await sections.save();

    res.send(sections)

}

export async function addSectionParticular(req: Request, res:Response){

    const params = req.params
    const body = req.body;

    const section = await Section.findById(params.id);


   if(section){
    const students = await User.find({section:section.section_name});

    // Assuming students is an array of User objects
    for (const student of students) {
        const fee = new Fee({
        amount: body.amount,
        particulars: body.particulars,
        student: student.id, // Access the id property of each student
        });
  

    // Save the fee to the database or perform any other necessary operations
    await fee.save();
   

    // Send email for each student
    await Mailer.sendMail('jaylord.bucayu@avyan.global', 'Fee Added', 'Your fee has been added.'); // Assuming you have access to student's email

    // Wait for 30 seconds before sending the next email
    await new Promise(resolve => setTimeout(resolve, 30000));

   }

   res.send('fee added')

   }


}
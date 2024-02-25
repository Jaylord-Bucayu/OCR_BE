
import { Request, Response } from "express";
import Fees from '../models/fees';


interface IStudentFeeWithTotal {
    totalAmount?: number | undefined;
  }

export async function getFeesList(req:Request, res: Response) {

  const data = req.body;
  const payment = await Fees.find(data).populate('student')
  res.send(payment)

}


export async function getFeesById(req:Request, res: Response) {

   const params = req.params;

   const fees = await Fees.findById(params.id)
     
   res.send(fees)
 
 }


 export async function createFee(req:Request, res: Response) {

  const data = req.body;

  const fees = new Fees(data);

  await fees.save();
    
  res.send(fees)

}


export async function getStudentFees(req:Request, res: Response) {

    const params = req.params;
    
    const fees = await Fees.find({student:params.id}).populate('student')
      

  // Calculate total amount
  const totalAmount: number = fees.reduce((total, fee) => {
  const feeAmount: number = fee.amount || 0; // Use 0 if fee.amount is null or undefined
    return total + feeAmount;
  }, 0);

  // Append totalAmount only to the last entity
  const feesWithTotal: IStudentFeeWithTotal[] = fees.map((fee, index) => ({
    ...fee.toObject(),
    totalAmount: index === fees.length - 1 ? totalAmount : undefined,
  }));

  res.send(feesWithTotal);

  
  }

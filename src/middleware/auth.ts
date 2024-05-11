import jwt from 'jsonwebtoken';
import Auth,{IAuth} from '../models/auth'; // Adjust import based on your model location
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Request type to include the 'auth' property
interface CustomRequest extends Request {
    auth?: IAuth | null; // Adjust the type accordingly based on your Auth model
}

const APP_KEY = process.env.APP_KEY || '';

const middleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        } else {
            token = (req.header('Authorization') || '').replace('Bearer ', '');
        }



        if (!token) {
            return res.status(401).send({message:"Unauthorized"});
        }

        const data = jwt.verify(token, APP_KEY) as { auth: string };
        const auth = await Auth.findById(data.auth);

        if (!auth) {
            return res.status(401).send('Session expired.');
        }

        auth.lastActive = new Date();
        await auth.save();

        req.auth = auth; // Assign the retrieved auth document to req.auth

        next();
    } catch (err) {
        console.error(err);
        // You may want to handle different error types separately
        return res.status(401).send('Access denied. Invalid token.');
    }
};

export default middleware;

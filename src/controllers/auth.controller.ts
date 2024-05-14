
import { Request, Response } from "express";
import User from '../models/user';
import Auth from '../models/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
require('dotenv').config();

export async function signUserInWithEmailPassword(req: Request, res: Response) {


    const appKey = process.env.APP_KEY;

if (!appKey) {
  throw new Error('APP_KEY environment variable is not defined');
}

    const data = req.body;
        // if (!data.username) data.username = data.username.toLowerCase();

    //    if (data.email != null) data.email = data.email.toLowerCase();
        
        let auth = null;

        if (data.email != null) {
            // console.log('Finding email...');
            auth = await Auth.findOne({ email: data.email }).select('+password');
        } else if (data.username != null) {
            auth = await Auth.findOne({
                username: data.username.toString().toLowerCase(),
            }).select('+password');
        } else if (data.mobile != null) {
            // console.log('Finding mobile...');
            auth = await Auth.findOne({
                'mobile.cc': data.country_code.toString(),
                'mobile.m': data.mobile.toString(),
            }).select('+password');
        } else {
            return res.send(
            'You must login with either email, mobile number, or username.'
            );
        }

        // console.log(auth);

        if (auth == null) {
            return res.send(
                'We can\'t find an account associated with this credential.'
             );
        }

        if (!await bcrypt.compare(data.password, auth.password)) {
            return res.send('Credentials are incorrect.');
        }

    const token = jwt.sign({ auth: auth.id.toString() }, appKey, {
            expiresIn: '30d',
        });

        res.cookie('jwt', token, {
            secure: process.env.APP_ENV !== 'development',
            httpOnly: true,
            sameSite: 'strict',
        });

        auth.lastActive = new Date();
        await auth.save();

        auth = auth.toJSON();
        // delete auth?.password;

       await User.findByIdAndUpdate(
            auth.id,
            {},
            { new: true, upsert: true }
        );

        
        res.send({
            'status': 'success',
            'message': 'Login successfully',
            'data': auth,
             'token':token,
             
            });
  

}

export async function signUserUpWithEmailPassword(req: Request, res:Response) {


    const data = req.body;


    

  
    var existingAuth = await Auth.find({ email: data.email });


    if (existingAuth.length != 0) {
        return res.send({
            'status': 'failed',
            'message': 'This email is already being used by another account',
        });
    }

    // if (data.email != null) {
    //     // data.email = data.email.toLowerCase();
    // }

    var auth = new Auth({
        email: data.email,
        password: bcrypt.hashSync(data.password, 10),
       
    });

  

    await auth.save()



   

    const token = jwt.sign({ auth: auth.id }, "kjjwqe2", {
        expiresIn: '30d'
    });

    res.cookie("jwt", token, {
        secure: process.env.APP_ENV !== "development",
        httpOnly: true,
        sameSite: 'strict'
    });

    auth = auth.toJSON();
    

   var user = await User.findByIdAndUpdate(auth.id, {}, { new: true, upsert: true });

   user.firstname = data.firstname,
    user.lastname = data.lastname;
    user.email = data.email;
  await user.save();
   //var user = await User.findByIdAndUpdate(auth.id, {}, { new: true, upsert: true });



   

    res.send({
        'status': 'success',
        'message': 'Registered successfully.',
        'data': {
            'auth': {
                ...auth,
                ...user.toJSON()
            },
            'token': token,
        },
    });
}

export async function resetPassword(req: Request, res: Response) {
    const {  userId,newPassword } = req.body;

    try {
        
    

        // Find the user by ID
        const user = await Auth.findById(userId);
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'User not found',
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Send success response
        res.send({
            status: 'success',
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send({
            status: 'error',
            message: 'Invalid or expired token',
        });
    }
}

// Function to delete a user
export async function deleteUser(req: Request, res: Response) {
    try {
        // Extract user ID from request parameters
        const userId = req.params.userId;

        // Delete the user by ID
        const user = await User.findByIdAndDelete(userId);
        const auth = await Auth.findByIdAndDelete(userId);

        if (!user && !auth) {
            return res.status(404).send({
                status: 'error',
                message: 'User not found',
            });
        }

        // Send success response
        res.send({
            status: 'success',
            message: 'User deleted successfully',
        });
    } catch (error) {
        // Handle errors
        console.error('Error deleting user:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal server error',
        });
    }
}
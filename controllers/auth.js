import User from '../models/user.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.NODEMAILER_API_KEY
  }
}));


const postLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()});
        }
        
        const { email, password } = req.body;
        const userExists = await User.findOne({email});
        if (!userExists) {
            return res.status(401).json({message: "Invalid email or password."});
        }
        const isMatch = await bcrypt.compare(password, userExists.password);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid email or password."});
        }

        const token = jwt.sign(
            {
                userId: userExists._id.toString()
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );
        
        res.status(200).json({message: "You logged in successfully.", token, userId: userExists._id.toString()});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }
}


const postSignup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()});
        }
        
        const { firstName, lastName, email, password } = req.body;
        const userExists = await User.findOne({ email: email });
        
        if (userExists) {
            return res.status(409).json({ message: "User already exists." });
        }
        
        const name = firstName.trim() + ' ' + lastName.trim();
        const saltRounds = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const user = new User({ name, email, password: hashedPassword });

        await user.save();

        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_SENDER,
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
        }, (err, info) => {
            if(!err) {
                console.log("Email Sent Successfully");
            }
        });
        
        return res.status(201).json({ message: "User Created successfully", user: user});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/confirm-reset-password?token=${resetToken}`;

        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_SENDER,
            subject: 'Password Reset Request',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your password. If you made this request, click the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;
                                  font-weight: bold; font-size: 16px;">
                            Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        <strong>This link will expire in 1 hour</strong> for security reasons.
                    </p>
                    
                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this password reset, please ignore this email. 
                        Your password will remain unchanged.
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    
                    <p style="color: #888; font-size: 12px;">
                        If the button above doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
                    </p>
                    
                    <p style="color: #888; font-size: 12px;">
                        This email was sent from our e-commerce platform. Please do not reply to this email.
                    </p>
                </div>
            `
        }, (err, info) => {
            if(!err) {
                console.log("Reset Email Sent Successfully");
            }
        });

        res.status(200).json({
            message: "Password reset email sent successfully. Please check your inbox."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

const confirmResetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const { password } = req.body;
        const { token } = req.query;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() } 
        });

        const saltRounds = parseInt(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        await transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL_SENDER,
            subject: 'Password Reset Successful',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #28a745;">✅ Password Reset Successful</h2>
                    <p>Hello ${user.name},</p>
                    <p>Your password has been successfully reset. You can now log in with your new password.</p>
                    <p style="color: #666; font-size: 14px;">
                        If you didn't make this change, please contact our support team immediately.
                    </p>
                </div>
            `
        });

        res.status(200).json({
            message: "Password reset successful. You can now log in with your new password."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

export default { postLogin, postSignup, resetPassword, confirmResetPassword };
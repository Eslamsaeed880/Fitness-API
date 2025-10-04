import { body, query } from 'express-validator';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

export const loginValidation = [
    body('email')
        .normalizeEmail()
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (!user) {
                throw new Error("Invalid user.");
            }
        }),
    body('password')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("Invalid user.");
            }
            const match = await bcrypt.compare(value, user.password);
            if (!match) {
                throw new Error("Invalid user.");
            }
        })  
];

export const signupValidation = [
    body('firstName').isLength({ min: 2, max: 40 }).isAlpha(),
    body('lastName').isLength({ min: 2, max: 40 }).isAlpha(),
    body('email')
        .isEmail().withMessage("Invalid Email.")
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) throw new Error("Email already exists.");
        }),
    body('password')
        .trim()
        .isAlphanumeric()
        .isLength({ min: 6 })
        .withMessage("The password has to be alpha numeric and more than 5 characters.")
];

export const resetPasswordValidator = [
    body('email')
        .isEmail()
        .withMessage("This isn't a valid email.")
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value});
            if(!user || user.role == 'google') {
                throw new Error('No user found with this email address.')
            }
        })
];

export const confirmResetPasswordValidator = [
    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters."),
    query('token')
        .notEmpty()
        .withMessage("Reset token is required.")
        .custom(async (value, {req}) => {
            const user = await User.findOne({
                resetToken: value, 
                resetTokenExpiry: { $gt: new Date() }
            });
            if(!user) {
                throw new Error("Invalid or expired reset token. Please request a new password reset.");
            }
            return true;
        })
];
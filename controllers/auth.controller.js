import User from '../models/user.model.js';
import APIError from '../utils/APIError.js';
import APIResponse from '../utils/APIResponse.js';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const signUp = async (req, res, next) => {
    try {
        const { fullName, username, email, password } = req.body;

        const exists = await User.findOne({ $or: [ { email }, { username } ] });
        if (exists) {
            return next(new APIError(409, "User with given email or username already exists"));
        }

        const userData = {
            fullName,
            username,
            email,
            password,
        };

        const newUser = new User(userData);

        await newUser.save();

        /* For media uploads and welcome email, we can enqueue background jobs like this:
        
        if (req.files?.avatar?.[0]?.path) {
            await enqueueMediaJob({
                eventId: crypto.randomUUID(),
                type: 'update-profile-pic',
                payload: {
                    userId: newUser._id.toString(),
                    username,
                    filePath: req.files.avatar[0].path,
                },
            });
        }

        if (req.files?.cover?.[0]?.path) {
            await enqueueMediaJob({
                eventId: crypto.randomUUID(),
                type: 'update-cover',
                payload: {
                    userId: newUser._id.toString(),
                    username,
                    filePath: req.files.cover[0].path,
                },
            });
        }

        await enqueueEmailEvent({
            eventId: crypto.randomUUID(),
            to: userData.email,
            subject: 'Welcome to Our Social Media App!',
            html: `<h2>Hi ${username},</h2><br><br>Thank you for signing up for our social media app! We're excited to have you on board.<br><br>Best regards,<br>The Team`,
        });
        */

        const response = new APIResponse(201, { createdUser: newUser }, "User registered successfully");
        res.status(response.statusCode).json(response);

    } catch (error) {
        console.error('Sign up error:', error);
        return next(new APIError(500, error.message || 'Failed to create user'));
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        
        if (!existingUser) {
            return next(new APIError(401, "Invalid email or password"));
        }
        
        const isMatch = await existingUser.comparePassword(password);
    
        if (!isMatch) {
            return next(new APIError(401, "Invalid email or password"));
        }
        
        const token = existingUser.generateToken();
        const response = new APIResponse(200, { user: existingUser, token }, "Login successful");

        res.status(response.statusCode).json(response);
    } catch (error) {
        console.error('Login error:', error);
        return next(new APIError(401, "Invalid email or password"));
    }
}

export const getGoogleAuthUrl = async (req, res) => {
    try {
        const redirectUri = encodeURIComponent(config.googleCallbackURL);
        const scope = encodeURIComponent('profile email');
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
        
        const response = new APIResponse(200, { authUrl: googleAuthUrl }, "Google authentication URL generated");
        res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json(new APIResponse(500, null, "Failed to generate Google auth URL", { errors: error.message }));
    }
}

export const googleLoginCallback = async (req, res) => {
    try {
        const token = jwt.sign(
            { 
                id: req.user._id, 
                role: req.user.role 
            }, 
            config.jwtSecretKey, 
            { expiresIn: config.tokenExpiry }
        );
        
        const response = new APIResponse(200, { user: req.user, token }, "Google authentication successful");
        res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json(new APIResponse(500, null, "Google authentication callback failed", { errors: error.message }));
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return next(new APIError(404, 'User with this email does not exist'));
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/confirm-reset-password?token=${resetToken}`;

        /* Enqueue password reset email job like this:
        await enqueueEmailEvent({
            eventId: crypto.randomUUID(),
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p>Hello ${user.username},</p>
                    <p>We received a request to reset your password. If you made this request, click the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
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
                        <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
                    </p>
                    
                    <p style="color: #888; font-size: 12px;">
                        This email was sent from our e-commerce platform. Please do not reply to this email.
                    </p>
                </div>
            `,
        });

        */

        res.status(200).json({
            message: "Password reset email sent successfully. Please check your inbox."
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return next(new APIError(500, error.message || "Failed to process password reset request"));
    }
}

export const confirmResetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { token } = req.query;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() } 
        });
        
        if (!user) {
            return next(new APIError(400, 'Invalid or expired reset token'));
        }

        const saltRounds = parseInt(config.bcryptSaltRounds);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        /* For sending password reset confirmation email, we can enqueue a job like this:
        await enqueueEmailEvent({
            eventId: crypto.randomUUID(),
            to: user.email,
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
            `,
        });
        */

        const response = new APIResponse(200, null, "Password reset successful");
        res.status(response.statusCode).json(response);
    } catch (err) {
        console.error('Confirm reset password error:', err);
        return next(new APIError(500, err.message || "Failed to reset password"));
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(new APIError(404, 'User not found'));
        }
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(new APIError(400, "Current password is incorrect"));
        }
        
        const saltRounds = parseInt(config.bcryptSaltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        
        await user.save();
        const response = new APIResponse(200, null, "Password changed successfully");
        res.status(response.statusCode).json(response);
    } catch (error) {
        console.error('Change password error:', error);
        next(new APIError(500, error.message || 'Server error'));
    }
}
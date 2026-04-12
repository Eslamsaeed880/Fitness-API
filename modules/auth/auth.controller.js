import APIError from '../../utils/APIError.js';
import APIResponse from '../../utils/APIResponse.js';
import AuthService from './auth.service.js';
import { enqueueEmailJob } from '../../infrastructure/queue/email.queue.js';

const authService = new AuthService();

const enqueueAuthEmailEvent = async ({ type, to, subject, html }) => {
    try {
        await enqueueEmailJob({ type, to, subject, html });
    } catch (error) {
        console.error(`[AuthEmailQueue] Failed to enqueue ${type}:`, error.message);
    }
};

const handleAuthError = (error, next, fallbackStatus, fallbackMessage) => {
    if (error instanceof APIError) {
        return next(error);
    }

    return next(new APIError(fallbackStatus, error.message || fallbackMessage));
};

export const signUp = async (req, res, next) => {
    try {
        const { fullName, username, email, password } = req.body;

        const { user, token } = await authService.signup(fullName, username, email, password);

        await enqueueAuthEmailEvent({
            type: 'auth.signup',
            to: user.email,
            subject: 'Welcome to Fitness API',
            html: `
                <h2>Welcome, ${user.fullName || username}!</h2>
                <p>Your account was created successfully.</p>
                <p>Username: <strong>${user.username}</strong></p>
            `
        });

        const response = new APIResponse(201, { user, token }, "User registered successfully");
        res.status(response.statusCode).json(response);

    } catch (error) {
        console.error('Sign up error:', error);
        return handleAuthError(error, next, 500, 'Failed to create user');
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authService.login(email, password);
        const response = new APIResponse(200, { user, token }, "Login successful");

        res.status(response.statusCode).json(response);
    } catch (error) {
        console.error('Login error:', error);
        return handleAuthError(error, next, 401, 'Invalid email or password');
    }
}

export const getGoogleAuthUrl = async (req, res, next) => {
    try {
        const googleAuthUrl = await authService.getGoogleAuthUrl();

        const response = new APIResponse(200, { authUrl: googleAuthUrl }, "Google authentication URL generated");
        res.status(response.statusCode).json(response);
    } catch (error) {
        return handleAuthError(error, next, 500, 'Failed to generate Google auth URL');
    }
}

export const googleLoginCallback = async (req, res, next) => {
    try {
        const { user, token } = await authService.googleLoginCallback(req.user);

        await enqueueAuthEmailEvent({
            type: 'auth.google',
            to: user.email,
            subject: 'Google authentication successful',
            html: `
                <h2>Hello ${user.fullName || user.username},</h2>
                <p>Your Google authentication was successful.</p>
                <p>If this was not you, please secure your account immediately.</p>
            `
        });

        const response = new APIResponse(200, { user, token }, "Google authentication successful");
        res.status(response.statusCode).json(response);
    } catch (error) {
        return handleAuthError(error, next, 500, 'Google authentication callback failed');
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const { resetLink, user } = await authService.resetPassword(email);

        await enqueueAuthEmailEvent({
            type: 'auth.reset_password',
            to: user.email,
            subject: 'Password reset request',
            html: `
                <h2>Reset your password</h2>
                <p>Hello ${user.fullName || user.username},</p>
                <p>Use the link below to reset your password (valid for 1 hour):</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>If you did not request this, you can ignore this email.</p>
            `
        });

        res.status(200).json({
            message: "Password reset email sent successfully. Please check your inbox."
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return handleAuthError(error, next, 500, 'Failed to process password reset request');
    }
}

export const confirmResetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { token } = req.query;

        const user = await authService.confirmResetPassword(token, password);

        await enqueueAuthEmailEvent({
            type: 'auth.confirm_reset_password',
            to: user.email,
            subject: 'Password reset successful',
            html: `
                <h2>Password updated successfully</h2>
                <p>Hello ${user.fullName || user.username},</p>
                <p>Your password was changed successfully.</p>
                <p>If you did not perform this action, contact support immediately.</p>
            `
        });

        const response = new APIResponse(200, null, "Password reset successful");
        res.status(response.statusCode).json(response);
    } catch (err) {
        console.error('Confirm reset password error:', err);
        return handleAuthError(err, next, 500, 'Failed to reset password');
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        await authService.changePassword(userId, currentPassword, newPassword);
        const response = new APIResponse(200, null, "Password changed successfully");
        res.status(response.statusCode).json(response);
    } catch (error) {
        console.error('Change password error:', error);
        return handleAuthError(error, next, 500, 'Server error');
    }
}
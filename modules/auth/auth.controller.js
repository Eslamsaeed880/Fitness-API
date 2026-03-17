import APIError from '../../utils/APIError.js';
import APIResponse from '../../utils/APIResponse.js';
import AuthService from './auth.service.js';

const authService = new AuthService();

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

        /* For welcome email, we can enqueue background jobs like this:

        await enqueueEmailEvent({
            eventId: crypto.randomUUID(),
            to: email,
            subject: 'Welcome to Our Social Media App!',
            html: `<h2>Hi ${username},</h2><br><br>Thank you for signing up for our social media app! We're excited to have you on board.<br><br>Best regards,<br>The Team`,
        });
        */

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
        return handleAuthError(error, next, 500, 'Failed to process password reset request');
    }
}

export const confirmResetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { token } = req.query;

        await authService.confirmResetPassword(token, password);

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
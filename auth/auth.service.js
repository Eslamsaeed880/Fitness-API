import User from '../users/user.model.js';
import APIError from '../utils/APIError.js';
import config from '../config/config.js';
import crypto from 'crypto';

export default class AuthService {

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new APIError(401, 'Invalid email or password');
        }

        if(user.authProvider === 'google') {
            throw new APIError(400, 'Please log in with Google for this account');
        }
        
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            throw new APIError(401, 'Invalid email or password');
        }


        const token = user.generateToken();

        return { user, token };
    }

    async signup(fullName, username, email, password) {
        const exists = await User.findOne({ $or: [{ email }, { username }] });

        if (exists) {
            throw new APIError(409, 'User with given email or username already exists');
        }

        const user = new User({ fullName, username, email, password });
        await user.save();

        return user;
    }

    async resetPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new APIError(404, 'User with this email does not exist');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000);

        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/confirm-reset-password?token=${resetToken}`;

        return { resetToken, resetLink, user };
    }

    async confirmResetPassword(token, password) {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            throw new APIError(400, 'Invalid or expired reset token');
        }

        // Password hashing is handled by the User pre-save hook.
        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        return user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);

        if (!user) {
            throw new APIError(404, 'User not found');
        }

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            throw new APIError(400, 'Current password is incorrect');
        }

        // Password hashing is handled by the User pre-save hook.
        user.password = newPassword;
        await user.save();

        return user;
    }

    async getGoogleAuthUrl() {
        const redirectUri = encodeURIComponent(config.googleCallbackURL);
        const scope = encodeURIComponent('profile email');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

        return authUrl;
    }

    async googleLoginCallback(user) {
        if (!user) {
            throw new APIError(401, 'Google authentication failed');
        }

        const token = user.generateToken();

        return { user, token };
    }

    async googleLogin() {

    }
}
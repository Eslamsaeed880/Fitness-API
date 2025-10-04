import express from 'express';
import authController from '../controllers/auth.js';
import passport from '../middleware/googleAuth.js';
import jwt from 'jsonwebtoken'; 
import { confirmResetPasswordValidator, loginValidation, resetPasswordValidator, signupValidation } from '../validation/authValidation.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({
      message: "Google authentication successful.",
      token,
      userId: req.user._id.toString()
    });
  }
);

router.post('/login', loginValidation, authController.postLogin);

router.post('/signup', signupValidation, authController.postSignup);

router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

router.post('/confirm-reset-password/', confirmResetPasswordValidator, authController.confirmResetPassword);

export default router;
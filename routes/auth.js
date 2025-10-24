import express from 'express';
import { postLogin, postSignup, resetPassword, confirmResetPassword } from '../controllers/auth.js';
import passport from '../middleware/googleAuth.js';
import jwt from 'jsonwebtoken'; 
import { confirmResetPasswordValidator, loginValidation, resetPasswordValidator, signupValidation } from '../validation/authValidation.js';
import limiter from '../middleware/rateLimit.js';

const router = express.Router();

router.use(limiter(5, 10));

router.post('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

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

router.post('/login', loginValidation, postLogin);

router.post('/signup', signupValidation, postSignup);

router.post('/reset-password', resetPasswordValidator, resetPassword);

router.post('/confirm-reset-password/', confirmResetPasswordValidator, confirmResetPassword);

export default router;
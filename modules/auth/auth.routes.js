import { upload } from "../../middleware/multer.js";
import express from 'express';
import { 
    signUp, 
    login, 
    confirmResetPassword, 
    changePassword,
    resetPassword,
    getGoogleAuthUrl,
    googleLoginCallback,
} from "./auth.controller.js";
import isAuth from "../../middleware/isAuth.js";
import passport from "passport";

const router = express.Router();

router.post("/signup", 
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]), 
    signUp
);

router.post("/login", login);

router.get("/google", getGoogleAuthUrl);

router.get("/google/callback", passport.authenticate('google', { session: false }), googleLoginCallback);

router.post("/password-reset", resetPassword);

router.patch("/confirm-reset-password",confirmResetPassword);

router.patch("/change-password", isAuth, changePassword);


export default router;
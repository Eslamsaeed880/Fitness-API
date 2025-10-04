import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            const saltRounds = parseInt(process.env.SALT_ROUNDS);

            if (!user) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: await bcrypt.hash(process.env.BASIC_PASSWORD, saltRounds), 
                authProvider: 'google'
              });
              await user.save();
            }

            return done(null, user);

            } catch (err) {
            return done(err, null);
            }
        }
    ));

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
      const user = await User.findById(id);
      done(null, user);
    });
};

export { configurePassport };
export default passport;
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import config from '../config/config.js';

const buildFallbackUsername = (email) => {
  const base = (email || 'user').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
  return `${base}${Math.floor(Math.random() * 1000000)}`;
};

const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: config.googleCallbackURL || '/api/v1/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (!user) {
              user = new User({
                fullName: profile.displayName,
                username: buildFallbackUsername(profile.emails[0].value),
                email: profile.emails[0].value,
                password: process.env.BASIC_PASSWORD || `google-${Math.random().toString(36).slice(2)}`,
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
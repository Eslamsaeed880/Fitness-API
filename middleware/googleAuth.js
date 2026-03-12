import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../modules/users/user.model.js';
import config from '../config/config.js';

const buildFallbackUsername = (email) => {
  const base = (email || 'user').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
  return `${base}${Math.floor(Math.random() * 1000000)}`;
};

const configurePassport = () => {
    if (!config.googleClientId || !config.googleClientSecret || !config.googleCallbackURL) {
      throw new Error('Google OAuth is misconfigured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL (or API_BASE_URL).');
    }

    passport.use(new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackURL
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
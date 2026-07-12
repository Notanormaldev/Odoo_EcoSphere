import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env.js';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: `http://localhost:${config.port}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google profile'), null);

          // Check if user exists with this email
          let user = await User.findOne({ email });

          if (user) {
            // Link Google ID if not linked
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isEmailVerified = true;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save({ validateBeforeSave: false });
            }
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              isEmailVerified: true,
              role: 'employee',
            });
          }

          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Not using sessions (JWT-based), but passport requires these
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

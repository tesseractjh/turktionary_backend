import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();
const { GOOGLE_AUTH_ID, GOOGLE_AUTH_SECRET, GOOGLE_AUTH_CALLBACK } =
  process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_AUTH_ID,
      clientSecret: GOOGLE_AUTH_SECRET,
      callbackURL: GOOGLE_AUTH_CALLBACK
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, provider, emails } = profile as unknown as GoogleUser;
      const user = { id, provider, email: emails?.[0]?.value };
      return done(null, user);
    }
  )
);

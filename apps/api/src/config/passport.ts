import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

const clientID = process.env.GOOGLE_CLIENT_ID || 'MOCK_GOOGLE_CLIENT_ID';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'MOCK_GOOGLE_CLIENT_SECRET';
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

if (clientID && clientID !== 'MOCK_GOOGLE_CLIENT_ID') {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          return done(null, profile as any);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.log('[Passport] Info: Real GOOGLE_CLIENT_ID is not configured. Google OAuth strategy registered with mock fallback.');
}

export default passport;

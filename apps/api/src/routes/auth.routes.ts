import { Router, Request, Response } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { User } from '../models/User.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rate-limit.js';
import { requireAuth } from '../middleware/auth.js';
import { generateRandomToken, hashToken } from '../utils/crypto.js';
import { signToken } from '../utils/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email/emailService.js';
import { RegisterInputSchema, LoginInputSchema } from '@ishraq/shared-types';

const router = Router();

const COOKIE_NAME = 'ishraq_session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SEVEN_DAYS_MS,
  });
};

// 1. Register Endpoint
router.post(
  '/register',
  authRateLimiter,
  validateBody(RegisterInputSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'Email is already registered' });
        return;
      }

      const rawVerificationToken = generateRandomToken();
      const hashedVerificationToken = hashToken(rawVerificationToken);
      const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // PRIVILEGE ESCALATION PREVENTION: role is hardcoded to 'member'
      const newUser = new User({
        name,
        email,
        passwordHash: password, // Pre-save hook hashes this
        role: 'member',
        emailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      });

      await newUser.save();

      // Send verification email
      await sendVerificationEmail(newUser, rawVerificationToken);

      // Issue JWT and HTTP-only cookie immediately
      const jwtToken = signToken({
        userId: newUser._id.toString(),
        role: newUser.role,
      });
      setAuthCookie(res, jwtToken);

      res.status(201).json({
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          emailVerified: newUser.emailVerified,
          bookmarks: newUser.bookmarks,
        },
        message: 'Registration successful. Please verify your email address.',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 2. Verify Email Endpoint
router.get(
  '/verify-email/:token',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tokenStr = String(req.params.token);
      const hashedIncomingToken = hashToken(tokenStr);

      const user = await User.findOne({
        emailVerificationToken: hashedIncomingToken,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ error: 'Invalid or expired verification token' });
        return;
      }

      user.emailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 3. Resend Verification Endpoint
router.post(
  '/resend-verification',
  authRateLimiter,
  validateBody(z.object({ email: z.string().email() })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (user && !user.emailVerified) {
        const rawVerificationToken = generateRandomToken();
        user.emailVerificationToken = hashToken(rawVerificationToken);
        user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();
        await sendVerificationEmail(user, rawVerificationToken);
      }

      res.status(200).json({
        message: 'If an unverified account exists for this email, a verification link has been sent.',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 4. Login Endpoint
router.post(
  '/login',
  authRateLimiter,
  validateBody(LoginInputSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Select passwordHash explicitly (since select: false by default)
      const user = await User.findOne({ email }).select('+passwordHash');

      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const jwtToken = signToken({
        userId: user._id.toString(),
        role: user.role,
      });
      setAuthCookie(res, jwtToken);

      res.status(200).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          bookmarks: user.bookmarks,
        },
        message: 'Logged in successfully',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 5. Logout Endpoint
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME);
  res.status(200).json({ message: 'Logged out successfully' });
});

// 6. Forgot Password Endpoint
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(z.object({ email: z.string().email() })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        const rawResetToken = generateRandomToken();
        user.passwordResetToken = hashToken(rawResetToken);
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        await sendPasswordResetEmail(user, rawResetToken);
      }

      // Always return same success message (prevent email enumeration)
      res.status(200).json({
        message: 'If an account exists for that email, a password reset link has been sent.',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 7. Reset Password Endpoint
router.post(
  '/reset-password/:token',
  validateBody(z.object({ newPassword: z.string().min(8) })),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tokenStr = String(req.params.token);
      const { newPassword } = req.body;
      const hashedIncomingToken = hashToken(tokenStr);

      const user = await User.findOne({
        passwordResetToken: hashedIncomingToken,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ error: 'Invalid or expired password reset token' });
        return;
      }

      user.passwordHash = newPassword; // Pre-save hook hashes password
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// 8. Get Current User (/me) Endpoint
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 9. Google OAuth Initiate Endpoint
router.get('/google', (req: Request, res: Response, next) => {
  const hasRealClientId = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'MOCK_GOOGLE_CLIENT_ID';
  if (hasRealClientId) {
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  } else {
    // Development fallback when Google OAuth keys are missing
    const mockEmail = (req.query.email as string) || 'mock.google.user@example.com';
    const mockName = (req.query.name as string) || 'Mock Google User';
    const mockGoogleId = (req.query.googleId as string) || 'google_mock_123456789';
    res.redirect(`/api/auth/google/callback?mock=true&email=${encodeURIComponent(mockEmail)}&name=${encodeURIComponent(mockName)}&googleId=${encodeURIComponent(mockGoogleId)}`);
  }
});

// 10. Google OAuth Callback Endpoint
router.get('/google/callback', async (req: Request, res: Response, next): Promise<void> => {
  const isMock = req.query.mock === 'true';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const handleOAuthUser = async (profileData: { googleId: string; email: string; name: string }) => {
    const { googleId, email, name } = profileData;

    // 1. Look up by googleId first
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Look up by email (account linking for existing email accounts)
      user = await User.findOne({ email });

      if (user) {
        // Link googleId and verify email if not already verified
        user.googleId = googleId;
        user.emailVerified = true;
        await user.save();
      } else {
        // 3. Create new user with hardcoded role 'member' and verified email
        user = new User({
          name: name || 'Google User',
          email: email.toLowerCase(),
          googleId,
          passwordHash: null,
          role: 'member',
          emailVerified: true,
        });
        await user.save();
      }
    }

    // 4. Issue JWT and HTTP-only cookie
    const jwtToken = signToken({
      userId: user._id.toString(),
      role: user.role,
    });
    setAuthCookie(res, jwtToken);

    // 5. Redirect browser back to frontend
    res.redirect(clientUrl);
  };

  if (isMock) {
    try {
      const email = String(req.query.email || 'mock.google.user@example.com');
      const name = String(req.query.name || 'Mock Google User');
      const googleId = String(req.query.googleId || 'google_mock_123456789');
      await handleOAuthUser({ googleId, email, name });
    } catch (error) {
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent((error as Error).message)}`);
    }
  } else {
    passport.authenticate('google', { session: false }, async (err: any, profile: any) => {
      if (err || !profile) {
        res.redirect(`${clientUrl}/login?error=Google+authentication+failed`);
        return;
      }

      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || 'Google User';

        if (!email) {
          res.redirect(`${clientUrl}/login?error=No+email+provided+by+Google`);
          return;
        }

        await handleOAuthUser({ googleId, email, name });
      } catch (error) {
        res.redirect(`${clientUrl}/login?error=${encodeURIComponent((error as Error).message)}`);
      }
    })(req, res, next);
  }
});

export default router;

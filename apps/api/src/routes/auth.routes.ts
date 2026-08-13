import { Router, Request, Response } from 'express';
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
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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

export default router;

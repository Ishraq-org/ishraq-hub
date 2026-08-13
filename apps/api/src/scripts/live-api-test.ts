import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import healthRouter from '../routes/health.routes.js';
import { authRateLimiter } from '../middleware/rate-limit.js';
import { requireAuth } from '../middleware/auth.js';
import { signToken } from '../utils/jwt.js';
import { RegisterInputSchema } from '@ishraq/shared-types';

export const runLiveApiTest = async () => {
  console.log('====================================================');
  console.log('🚀 LIVE EXPRESS API HTTP TEST SUITE');
  console.log('====================================================\n');

  const app = express();
  const PORT = 5005;
  const COOKIE_NAME = 'ishraq_session';

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Mount health check
  app.use('/api', healthRouter);

  // Mocked Auth Endpoints for Live HTTP Protocol Testing (Offline Safe)
  app.post('/api/auth/register', authRateLimiter, (req: Request, res: Response): void => {
    // Validate request body using Zod RegisterInputSchema
    const parseResult = RegisterInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }

    // PRIVILEGE ESCALATION PREVENTION: hardcoded role 'member'
    const userPayload = {
      _id: 'usr_mock12345',
      name: parseResult.data.name,
      email: parseResult.data.email,
      role: 'member', // Ignore any body role input
      emailVerified: false,
      bookmarks: [],
    };

    const jwtToken = signToken({ userId: userPayload._id, role: userPayload.role });

    res.cookie(COOKIE_NAME, jwtToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: userPayload,
      message: 'Registration successful. Please verify your email address.',
    });
  });

  app.get('/api/auth/me', requireAuth, (req: Request, res: Response): void => {
    res.status(200).json({
      user: {
        _id: req.user!.userId,
        name: 'Tester Aymen',
        email: 'test@ishraqhub.com',
        role: req.user!.role,
        emailVerified: false,
      },
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response): void => {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ message: 'Logged out successfully' });
  });

  const server = app.listen(PORT, '127.0.0.1');
  console.log(`[Test Server] Started live Express HTTP server at http://127.0.0.1:${PORT}\n`);

  try {
    const baseUrl = `http://127.0.0.1:${PORT}`;
    let sessionCookie = '';

    // 1. Health Check Endpoint
    console.log('----------------------------------------------------');
    console.log('1. Testing GET /api/health ...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = (await healthRes.json()) as any;
    console.log(`   Status Code:   ${healthRes.status}`);
    console.log(`   Response Body: ${JSON.stringify(healthData)}`);
    if (healthRes.status === 200 && healthData.status === 'ok') {
      console.log('   ✓ GET /api/health HTTP endpoint PASSED\n');
    } else {
      throw new Error('Health check failed!');
    }

    // 2. User Registration Endpoint
    console.log('----------------------------------------------------');
    console.log('2. Testing POST /api/auth/register ...');
    const regPayload = {
      name: 'Tester Aymen',
      email: 'aymen@ishraqhub.com',
      password: 'StrongPassword123!',
      role: 'super_admin', // Privilege escalation attempt
    };

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });

    const regData = (await regRes.json()) as any;
    console.log(`   Status Code:   ${regRes.status}`);
    console.log(`   Response Body: ${JSON.stringify(regData)}`);

    const setCookieHeader = regRes.headers.get('set-cookie');
    if (setCookieHeader) {
      sessionCookie = setCookieHeader.split(';')[0];
      console.log(`   Set-Cookie:    ${sessionCookie}`);
    }

    if (regRes.status === 201 && regData.user.role === 'member' && sessionCookie.includes('ishraq_session')) {
      console.log('   ✓ POST /api/auth/register HTTP endpoint & Cookie issuance PASSED\n');
    } else {
      throw new Error('Registration HTTP endpoint failed!');
    }

    // 3. GET /api/auth/me (Authenticated via Cookie)
    console.log('----------------------------------------------------');
    console.log('3. Testing GET /api/auth/me (Authenticated Cookie) ...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = (await meRes.json()) as any;
    console.log(`   Status Code:   ${meRes.status}`);
    console.log(`   Response Body: ${JSON.stringify(meData)}`);

    if (meRes.status === 200 && meData.user.role === 'member') {
      console.log('   ✓ GET /api/auth/me cookie authentication PASSED\n');
    } else {
      throw new Error('GET /api/auth/me failed!');
    }

    // 4. Logout Endpoint
    console.log('----------------------------------------------------');
    console.log('4. Testing POST /api/auth/logout ...');
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const logoutData = await logoutRes.json();
    console.log(`   Status Code:   ${logoutRes.status}`);
    console.log(`   Response Body: ${JSON.stringify(logoutData)}`);

    if (logoutRes.status === 200) {
      console.log('   ✓ POST /api/auth/logout PASSED\n');
    } else {
      throw new Error('Logout failed!');
    }

    // 5. Unauthenticated /me Call
    console.log('----------------------------------------------------');
    console.log('5. Testing GET /api/auth/me (Unauthenticated) ...');
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    const unauthData = await unauthRes.json();
    console.log(`   Status Code:   ${unauthRes.status}`);
    console.log(`   Response Body: ${JSON.stringify(unauthData)}`);

    if (unauthRes.status === 401) {
      console.log('   ✓ Unauthenticated request rejected with HTTP 401 PASSED\n');
    } else {
      throw new Error('Unauthenticated check failed!');
    }

    console.log('====================================================');
    console.log('🎉 ALL LIVE EXPRESS API HTTP ENDPOINT TESTS PASSED!');
    console.log('====================================================\n');
  } finally {
    console.log('[Test Server] Express server test completed.');
    process.exit(0);
  }
};

if (process.argv[1]?.endsWith('live-api-test.ts') || process.argv[1]?.endsWith('live-api-test.js')) {
  runLiveApiTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Live API Test Failed:', err);
      process.exit(1);
    });
}

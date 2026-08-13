import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);

// Attempt database connection if URI exists
connectDB();

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
  });
}

export default app;

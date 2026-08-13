import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import articlesRouter from './routes/articles.js';
import topicsRouter from './routes/topics.js';
import adminDashboardRouter from './routes/admin-dashboard.js';
import adminUsersRouter from './routes/admin-users.js';
import uploadsRouter from './routes/uploads.js';
import sponsorsRouter from './routes/sponsors.js';
import adminInquiriesRouter from './routes/admin-inquiries.js';
import { bot } from './bot/telegramBot.js';
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

// Telegram Bot Webhook Endpoint (Master Prompt §9, Prompt 16 §3)
if (process.env.TELEGRAM_BOT_TOKEN) {
  app.use(bot.webhookCallback('/api/telegram/webhook'));
}

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/admin', adminDashboardRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/inquiries', adminInquiriesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/sponsors', sponsorsRouter);

// Attempt database connection if URI exists
connectDB();

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
  });
}

export default app;

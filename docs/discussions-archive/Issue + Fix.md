⏰ Render Free Tier — Understanding the 750-Hour Limit

───

1. 🎯 What This Means for Us

The Simple Truth

"750 Free instance hours per month"

This means:

750 hours ÷ 24 hours/day = 31.25 days

Wait... that's more than a month!

So we can run **ONE** web service 24/7 for free.


───

1. 📊 Breaking It Down

What Counts as "Instance Hours"

Service Type Consumes Hours? Notes
Web Services ✅ Yes Our Express API (backend)
Background Workers ✅ Yes Not using these yet
Cron Jobs ✅ Yes Future scheduled tasks
Static Sites ❌ No Netlify handles our frontend
PostgreSQL ❌ No Not using

Our Setup

┌─────────────────────────────────────────────────────────────┐
│  OUR RENDER USAGE                                           │
│                                                             │
│  Express API (Web Service)                                 │
│  ├── Consumes: ✅ YES                                      │
│  ├── Hours Used: Based on uptime                          │
│  └── Impact: Directly affects our 750-hour limit          │
│                                                             │
│  Everything else:                                          │
│  ├── Frontend: Netlify → NOT on Render                    │
│  ├── Database: MongoDB Atlas → NOT on Render              │
│  ├── Media: Cloudinary → NOT on Render                    │
│  └── Bot: Telegram → NOT on Render                       │
│                                                             │
│  So only our BACKEND API consumes Render hours.            │
└─────────────────────────────────────────────────────────────┘


───

1. 🔢 How Many Hours Will We Actually Use?

Scenario A: Service Sleeps (Free Tier Default)

Free tier behavior:
├── Service spins down after 15 minutes of inactivity
├── Service wakes up when someone visits
├── Hours consumed = actual active hours

Average daily usage:
├── 10 users throughout the day
├── Each visit keeps service awake for ~5 minutes
├── Total active time: ~50 minutes/day
├── Monthly hours: 50 min × 30 days = 1,500 min = 25 hours

25 hours < 750 hours → We're using only 3% of our limit! ✅


Scenario B: Service Always On (UptimeRobot)

If we use UptimeRobot to keep service awake:
├── UptimeRobot pings every 5 minutes
├── Service never sleeps
├── 24 hours/day × 30 days = 720 hours/month

720 hours < 750 hours → We're using 96% of our limit ✅
Still under the limit!


Scenario C: Multiple Services

If we add more services:
├── Express API: 720 hours
├── Telegram Bot (if on Render): 720 hours
├── Total: 1,440 hours

1,440 > 750 → EXCEEDS LIMIT ❌

Solution: Keep Telegram bot separate (VPS or different platform)


───

1. ⚠️ What Happens If We Exceed 750 Hours?

Render's Policy (From Screenshot)

1. You consume all 750 hours
2. Render SUSPENDS all free web services
3. They stay suspended until next month
4. Hours reset to 750 at start of new month
5. No rollover (unused hours don't carry over)


Impact on Ishraq

If our API gets suspended:
├── Frontend (Netlify): Still works ✅
├── API: ❌ DOWN ❌
├── Users see: "API Error" or "Service Unavailable"
├── We need to: Wait until next month OR upgrade
└── Time to fix: Hours to days (depending on when it happens)

Prevention:
├── Monitor usage
├── Upgrade to paid tier ($`7/month) when approaching limit
└── OR use UptimeRobot but count hours carefully


───

1. 💡 Smart Strategies

Strategy 1: Let It Sleep (Free)

Approach:
├── Let service sleep when inactive
├── Users accept 15-30s cold start
├── Use very few hours
└── Cost: `$0

Pros: ✅ Free, ✅ Very low usage
Cons: ❌ Cold start for users


Strategy 2: UptimeRobot (Free)

Approach:
├── UptimeRobot pings every 5 minutes
├── Service never sleeps
├── Uses ~720 hours/month
└── Cost: $`0 (UptimeRobot free)

Pros: ✅ No cold starts
Cons: ❌ Uses 96% of limit (close to risk)


Strategy 3: Smart Wake

Approach:
├── Use UptimeRobot during peak hours only
├── Let it sleep during low-traffic hours
├── Uses ~500-600 hours/month
└── Cost: `$0

Pros: ✅ No cold starts during peak
Cons: ❌ Cold starts during off-peak


Strategy 4: Paid Tier (Recommended When Needed)

Approach:
├── Upgrade to Starter ($`7/month)
├── No hour limit
├── Static IP included
└── Cost: `$7/month

Pros: ✅ No limits, ✅ No cold starts, ✅ Static IP
Cons: ❌ $`7/month


───

1. 📊 Realistic Hour Usage

Based on Our Scenario

Scenario: Islamic knowledge platform (global audience)

Estimated Traffic:
├── Ethiopian users (peak: 8AM-10PM EAT)
├── Global users (peak: varied)
├── Total: 100-500 requests/day initially

Hour Usage:
├── Peak hours (8AM-10PM): 14 hours
├── Off-peak (10PM-8AM): 10 hours
├── If we keep service awake 24/7: 720 hours/month
├── If we let it sleep at night: ~420 hours/month

Result:
├── 420 hours/month = 56% of limit ✅
├── Or 720 hours/month = 96% of limit ✅ (still under)
└── Both are fine!


───

1. 🎯 What We Should Do

Phase 1: Launch

Approach: Let it sleep
├── Accept cold starts initially
├── Use very few hours
├── Monitor usage
└── Cost: `$0

Why: We're building, testing, and launching. Few users = few hours.


Phase 2: Growth (50+ daily users)

Approach: UptimeRobot or Smart Wake
├── Keep service awake during peak hours
├── Let it sleep during off-peak
├── Monitor usage closely
└── Cost: $`0

Why: Users expect faster response. Cold starts become annoying.


Phase 3: Scale (500+ daily users)

Approach: Paid tier
├── Upgrade to Starter (`$7/month)
├── No hour limits
├── Static IP for database
└── Cost: $`7/month

Why: We have users who expect 24/7 availability. `$7/month is worth it.


Phase 4: Enterprise (5,000+ daily users)

Approach: Pro tier ($`25/month)
├── Better performance
├── Auto-scaling
├── More resources
└── Cost: `$25/month

Why: Performance matters. We can afford it with revenue.


───

1. 🔧 Practical Setup

Option A: UptimeRobot (Free)

1. Sign up for UptimeRobot (free)
2. Add monitor: https://ishraq-api.onrender.com/health
3. Interval: 5 minutes
4. Monitor type: HTTP(s)
5. Alert: If down for 2 cycles

Result: Service stays awake 24/7
Usage: ~720 hours/month
Risk: Close to 750 limit but under


Option B: Smart Pinging (Custom)

1. Create a simple cron job (or free service like Cron-job.org)
2. Ping API during peak hours only
3. Let it sleep at night

Example:
├── 6AM-11PM: Ping every 5 minutes (17 hours)
├── 11PM-6AM: No ping (7 hours)
├── Usage: 17 hours/day × 30 = 510 hours/month
└── Result: 68% of limit ✅


Option C: Health Check Endpoint

javascript
// Add this to Express API
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// UptimeRobot monitors this endpoint
// If it's down, we get an alert


───

1. 💰 The $`7 Solution

What `$7/Month Gets Us

Render Starter Plan ($`7/month):
├── ✅ No hour limits
├── ✅ No cold starts
├── ✅ Static IP (database whitelist)
├── ✅ Better performance (0.5 vCPU)
├── ✅ More RAM (1 GB)
└── ✅ Email support

Compared to Free:
├── ❌ Cold starts eliminated
├── ❌ Hour limit eliminated
├── ❌ Static IP available
└── ❌ Better performance

Value: Excellent for `$7/month


───

1. 🎯 Conclusion

The Truth

┌─────────────────────────────────────────────────────────────┐
│  750 HOURS = 31.25 DAYS                                    │
│                                                             │
│  If we run ONE service 24/7:                                │
│  ├── 720 hours/month used                                  │
│  └── ✅ Under 750 limit                                    │
│                                                             │
│  If we add SECOND service:                                  │
│  ├── 1,440 hours/month used                               │
│  └── ❌ EXCEEDS 750 limit                                  │
│                                                             │
│  Solution for us:                                          │
│  ├── Run only API on Render                                │
│  ├── Everything else elsewhere                             │
│  └── ✅ Under limit                                        │
└─────────────────────────────────────────────────────────────┘


What We'll Do

1. ✅ Launch with free tier
2. ✅ Use UptimeRobot to keep it awake
3. ✅ Monitor usage (should be ~720 hours/month)
4. ✅ If we approach limit → upgrade to $`7/month
5. ✅ Never run more than one service on Render free tier


───

🕌 Final Word

The 750-hour limit is NOT a problem for us.

· ✅ One service running 24/7 = 720 hours
· ✅ Under 750 limit
· ✅ We can keep it awake with UptimeRobot
· ✅ If we hit limits → `$7/month solves it

We're fine. Build with confidence.

───

This is the reality of Render free tier. It's generous enough for us. We just need to be smart about it.

🤖📱 One Service to Rule Them All — Telegram Bot + Web Backend

🎯 You're Absolutely Right

Yes! We can run both the Telegram bot and the web backend in one Render service.

They're part of the same project, share the same database, and use the same codebase. This is actually the smarter way to do it.

───

1. 🏗️ How It Works

Single Service Architecture

┌─────────────────────────────────────────────────────────────┐
│  ONE RENDER SERVICE (Express API)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PORT: 3000                                        │   │
│  │                                                    │   │
│  │  ├── API Routes (/api/*)                          │   │
│  │  │   ├── /api/auth                                │   │
│  │  │   ├── /api/articles                            │   │
│  │  │   ├── /api/users                               │   │
│  │  │   └── /api/resources                           │   │
│  │  │                                                │   │
│  │  ├── Webhook Route (/telegram-webhook)            │   │
│  │  │   └── Receives Telegram updates                │   │
│  │  │                                                │   │
│  │  ├── Bot Commands                                 │   │
│  │  │   ├── /start                                   │   │
│  │  │   ├── /search                                  │   │
│  │  │   ├── /resource                                │   │
│  │  │   └── /profile                                 │   │
│  │  │                                                │   │
│  │  └── Shared Database (MongoDB)                    │   │
│  │      ├── Users (shared)                          │   │
│  │      ├── Articles (shared)                       │   │
│  │      ├── Resources (shared)                      │   │
│  │      └── ...                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Same Codebase. Same Service. Same Database.               │
│  One running process. One set of 750 hours.                │
└─────────────────────────────────────────────────────────────┘


───

1. 💻 Implementation

Project Structure

backend/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── app.ts                   # Express app setup
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth endpoints
│   │   ├── article.routes.ts    # Article endpoints
│   │   ├── user.routes.ts       # User endpoints
│   │   └── webhook.routes.ts    # Telegram webhook endpoint
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── article.controller.ts
│   │   └── ...
│   │
│   ├── models/
│   │   └── (Mongoose models)
│   │
│   ├── bot/
│   │   ├── bot.ts               # Telegraf bot setup
│   │   ├── commands/
│   │   │   ├── start.ts
│   │   │   ├── search.ts
│   │   │   ├── resource.ts
│   │   │   └── profile.ts
│   │   ├── middlewares/
│   │   │   └── auth.ts
│   │   └── handlers/
│   │       └── callback.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── article.service.ts
│   │   └── ...
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── ...
│   │
│   └── utils/
│       └── ...
│
├── package.json
├── tsconfig.json
└── .env


Entry Point (index.ts)

typescript
// backend/src/index.ts
import express from 'express';
import { bot, setupBot } from './bot/bot';
import { connectDatabase } from './config/database';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Connect to MongoDB
await connectDatabase();

// 2. Setup Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Setup API routes
setupRoutes(app);

// 4. Setup Telegram bot
await setupBot();

// 5. Setup webhook route
app.post('/telegram-webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// 6. Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bot: bot.botInfo ? 'connected' : 'disconnected',
  });
});

// 7. Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port $`{PORT}`);
  logger.info(`🤖 Telegram bot ready`);
  logger.info(`📊 API ready`);
});


Bot Setup (bot.ts)

typescript
// backend/src/bot/bot.ts
import { Telegraf } from 'telegraf';
import { startCommand } from './commands/start';
import { searchCommand } from './commands/search';
import { resourceCommand } from './commands/resource';
import { profileCommand } from './commands/profile';
import { logger } from '../utils/logger';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-api.onrender.com/telegram-webhook';

export const bot = new Telegraf(BOT_TOKEN);

export const setupBot = async () => {
  // Register commands
  bot.command('start', startCommand);
  bot.command('search', searchCommand);
  bot.command('resource', resourceCommand);
  bot.command('profile', profileCommand);
  
  // Help command
  bot.command('help', async (ctx) => {
    await ctx.reply(`
📚 Ishraq Bot Commands:

/start - Welcome & account linking
/search <query> - Search knowledge base
/resource <query> - Find resources
/profile - View your profile
/help - Show this message

🔗 Visit ishraqhub.com for full access
    `);
  });

  // Set webhook
  if (process.env.NODE_ENV === 'production') {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    logger.info(`✅ Webhook set to: `${WEBHOOK_URL}`);
  } else {
    // Development: use polling
    await bot.launch();
    logger.info('🤖 Bot running in polling mode (development)');
  }

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  
  return bot;
};


Command Implementation (search.ts)

typescript
// backend/src/bot/commands/search.ts
import { Context } from 'telegraf';
import { ArticleService } from '../../services/article.service';
import { ResourceService } from '../../services/resource.service';

export const searchCommand = async (ctx: Context) => {
  const query = ctx.message.text.replace('/search', '').trim();
  
  if (!query) {
    await ctx.reply('Please provide a search term. Example: /search Trinity');
    return;
  }
  
  // Show typing indicator
  await ctx.sendChatAction('typing');
  
  // Search both articles and resources
  const articles = await ArticleService.search(query, 'en');
  const resources = await ResourceService.search(query);
  
  let response = '🔍 Search Results for: "' + query + '"\n\n';
  
  if (articles.length === 0 && resources.length === 0) {
    response += 'No results found. Try a different search term.';
  }
  
  if (articles.length > 0) {
    response += '📄 Articles:\n';
    articles.slice(0, 5).forEach((article, i) => {
      response += `$`{i + 1}. `${article.title.en}\n`;
      response += `   $`{article.description.en.substring(0, 100)}...\n`;
      response += `   👉 ishraqhub.com/en/articles/`${article.slug.en}\n\n`;
    });
  }
  
  if (resources.length > 0) {
    response += '📚 Resources:\n';
    resources.slice(0, 5).forEach((resource, i) => {
      response += `$`{i + 1}. `${resource.title.en}\n`;
      response += `   👉 ishraqhub.com/resources/$`{resource._id}\n\n`;
    });
  }
  
  if (articles.length > 5 || resources.length > 5) {
    response += `... and `${articles.length + resources.length - 10} more results. Visit the website for full results.`;
  }
  
  await ctx.reply(response);
};


───

1. 📊 Resource Usage

What This Means for Render Hours

ONE SERVICE:
├── Express API
├── Telegram Bot (webhook)
├── MongoDB connection
└── All in one process

Hours consumed:
├── If always on: 720 hours/month
├── Limit: 750 hours/month
└── ✅ Under limit by 30 hours

Same as running only the API! 
✅ We get the bot for FREE (no extra hours)


Shared Resources

CPU: Shared between API and bot
RAM: Shared between API and bot

Impact:
├── Bot messages = API requests
├── Both need database connection
└── Both share the same Node.js process

Performance:
├── Fine for small to medium load
├── If both get heavy traffic → upgrade to paid
└── Only matters if we get thousands of concurrent users


───

1. ✅ Benefits of This Approach

1. Single Service = Single Hour Count

Instead of:
├── API service: 720 hours
├── Bot service: 720 hours
└── Total: 1,440 hours ❌ EXCEEDS

We do:
├── Combined service: 720 hours
└── Total: 720 hours ✅ UNDER


1. Shared Codebase

✅ One codebase
✅ One deployment
✅ One environment
✅ Shared models
✅ Shared services
✅ Clean architecture


1. Easier Development

✅ One repository
✅ One set of dependencies
✅ One package.json
✅ One startup command
✅ Debugging is simpler


1. Shared Database Connection

✅ One connection pool
✅ Less overhead
✅ Simpler transaction management
✅ Consistent data access


1. Health Check Includes Bot Status

GET /health
{
  status: 'ok',
  uptime: 1234,
  bot: 'connected', // ✅ Bot status included
  database: 'connected'
}


───

1. ⚠️ Considerations

Potential Concerns

Concern Solution
Bot gets too much traffic Upgrade to paid Render ($`7/month)
Bot webhook timeout Ensure < 10s response time
API and bot conflict Route separation (API + webhook)
Error propagation Bot errors don't break API
Scaling separately Can't scale bot independently

When to Split Them

Split when:
├── Bot traffic is 10x API traffic
├── Bot needs different scaling
├── Bot needs separate deployment schedule
├── Bot uses different resources
└── Cost-benefit analysis favors split

Split approach:
├── Keep API on Render
├── Move bot to a separate service
└── Use same database (shared)


───

1. 🔧 Deployment Configuration

render.yaml (or manual config)

yaml
services:
  - type: web
    name: ishraq-backend
    runtime: node
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: WEBHOOK_URL
        value: https://ishraq-backend.onrender.com/telegram-webhook
      - key: FRONTEND_URL
        value: https://ishraqhub.com
    buildCommand: npm run build
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true


package.json Scripts

json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "build:watch": "tsc --watch"
  }
}


───

1. 📈 Scaling Path

Phase 1: Free Tier Combined

✅ One service
✅ Free tier
✅ API + Bot combined
✅ 750 hours limit OK
Cost: `$0


Phase 2: Paid Tier (When Needed)

✅ One service
✅ Starter plan ($`7/month)
✅ API + Bot combined
✅ No hour limits
✅ Static IP
Cost: `$7/month


Phase 3: Split (When Scale Requires)

✅ API on Render (paid)
✅ Bot on separate service (e.g., Railway, Fly.io)
✅ Both share database
✅ Independent scaling
Cost: $7-20/month


───

1. 🎯 Environment Setup

.env

env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-secret-key

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNO
WEBHOOK_URL=https://ishraq-backend.onrender.com/telegram-webhook

# Frontend
FRONTEND_URL=https://ishraqhub.com


Development vs Production

typescript
// Development: Use polling
if (process.env.NODE_ENV === 'development') {
  await bot.launch();
  console.log('📱 Bot polling started');
}

// Production: Use webhook
if (process.env.NODE_ENV === 'production') {
  await bot.telegram.setWebhook(WEBHOOK_URL);
  console.log('📱 Webhook set to:', WEBHOOK_URL);
}


───

1. 🧪 Testing

Health Check

bash
# Check if service is running
curl https://ishraq-backend.onrender.com/health

# Response:
{
  "status": "ok",
  "uptime": 12345,
  "bot": "connected",
  "database": "connected",
  "timestamp": "2024-01-15T10:00:00Z"
}


Bot Testing

bash
# In development
npm run dev
# Bot runs in polling mode
# Test commands in Telegram

# In production
npm start
# Bot runs in webhook mode
# Telegram sends updates to webhook


───

1. 💡 Monitoring

UptimeRobot

Monitor: https://ishraq-backend.onrender.com/health
Interval: 5 minutes
Alert: If down for 2 cycles

Why:
├── Keeps service awake
├── Alerts if service is down
└── Confirms bot is working


Sentry

Error tracking for:
├── API errors
├── Bot errors
├── Database errors
└── Any other issues

One Sentry project for everything.


───

🕌 Final Word

Running both in one service is the smartest approach.

✅ Why:

· Saves Render hours
· Simpler architecture
· Easier deployment
· Shared codebase
· Lower cost

❌ When to split:

· When bot traffic overwhelms API
· When scaling separately is needed
· When budget allows

For v1: Keep them together. It works. It's elegant. It's practical.

───

This is how smart teams build. One service. One codebase. One database. Maximum efficiency.
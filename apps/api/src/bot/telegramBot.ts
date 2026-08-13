import { Telegraf, Markup } from 'telegraf';
import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { Inquiry } from '../models/Inquiry.js';

const token = process.env.TELEGRAM_BOT_TOKEN || 'dummy_token';
export const bot = new Telegraf(token);

// 1. In-Memory Per-User Rate Limiter (Prompt 16 §50-56: 10 msgs per 60 seconds per telegramUserId)
const userMessageTimestamps = new Map<string, number[]>();

bot.use(async (ctx, next) => {
  const userId = ctx.from?.id ? String(ctx.from.id) : null;
  if (!userId) return next();

  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxLimit = 10;

  const timestamps = (userMessageTimestamps.get(userId) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxLimit) {
    await ctx.reply('Rate limit exceeded. Please wait a minute before sending another message.');
    return;
  }

  timestamps.push(now);
  userMessageTimestamps.set(userId, timestamps);
  return next();
});

// 2. In-Memory Session State for "Waiting for Contact Message"
const userSessions = new Map<string, { waitingForContact: boolean }>();

// 3. /start Command (Prompt 16 §31-35)
bot.start(async (ctx) => {
  const welcomeText =
    'Welcome to Ishraq Hub. We provide scholarly Islamic apologetics research, manuscript evidence, and misconception refutations across English and Amharic.\n\nVisit our hub: https://ishraqhub.com';

  const replyKeyboard = Markup.keyboard([['Latest Articles', 'Contact Us']])
    .resize()
    .oneTime(false);

  await ctx.reply(welcomeText, replyKeyboard);
});

// 4. "Latest Articles" Action (Prompt 16 §36-42)
async function handleLatestArticles(ctx: any) {
  try {
    const telegramLang = ctx.from?.language_code || 'en';
    const lang = telegramLang.toLowerCase().startsWith('am') ? 'am' : 'en';

    const recentArticles = await ArticleTranslation.find({
      language: lang,
      status: 'published',
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    if (recentArticles.length === 0) {
      await ctx.reply(`No published articles available in ${lang.toUpperCase()} yet.`);
      return;
    }

    const baseUrl = process.env.CLIENT_URL || 'https://ishraq-hub.netlify.app';
    let messageText = `Latest Articles (${lang.toUpperCase()}):\n\n`;

    recentArticles.forEach((art: any, index: number) => {
      const articleUrl = `${baseUrl}/${art.language}/articles/${art.slug}`;
      messageText += `${index + 1}. ${art.title}\n${articleUrl}\n\n`;
    });

    await ctx.reply(messageText.trim());
  } catch (err) {
    console.error('Failed to fetch latest articles for Telegram bot:', err);
    await ctx.reply('Failed to fetch latest articles. Please try again later.');
  }
}

bot.hears('Latest Articles', handleLatestArticles);
bot.command('latest', handleLatestArticles);

// 5. "Contact Us" Action (Prompt 16 §43-48)
async function handleContactUs(ctx: any) {
  const userId = ctx.from?.id ? String(ctx.from.id) : null;
  if (userId) {
    userSessions.set(userId, { waitingForContact: true });
  }

  await ctx.reply(
    'Please type your message below. We will receive it as a direct inquiry for admin review.'
  );
}

bot.hears('Contact Us', handleContactUs);
bot.command('contact', handleContactUs);

// 6. Generic Text Listener (Captures Inquiry or Triggers Commands)
bot.on('text', async (ctx) => {
  const userId = ctx.from?.id ? String(ctx.from.id) : null;
  const username = ctx.from?.username || null;
  const text = ctx.message.text.trim();

  const session = userId ? userSessions.get(userId) : null;

  if (session?.waitingForContact) {
    // Capture Inquiry in MongoDB
    try {
      const newInquiry = new Inquiry({
        telegramUserId: userId,
        telegramUsername: username,
        message: text,
        status: 'new',
      });
      await newInquiry.save();

      // Clear Session State
      if (userId) {
        userSessions.delete(userId);
      }

      await ctx.reply("Thank you, we've received your message — someone will review it soon.");
    } catch (err) {
      console.error('Failed to save inquiry:', err);
      await ctx.reply('Failed to save your inquiry. Please try again.');
    }
  } else {
    // Default Fallback
    await ctx.reply(
      'Use the buttons below or type /start to view available options.',
      Markup.keyboard([['Latest Articles', 'Contact Us']])
        .resize()
        .oneTime(false)
    );
  }
});

export default bot;

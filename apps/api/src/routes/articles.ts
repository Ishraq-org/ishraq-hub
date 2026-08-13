import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Article } from '../models/Article.js';
import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { Topic } from '../models/Topic.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { syncArticleLinks } from '../services/link-graph.js';
import { z } from 'zod';
import { ArticleTypeSchema, ArticleLanguageSchema } from '@ishraq/shared-types';

export const articlesRouter = Router();

function slugify(text: string): string {
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\u1200-\u137F\-]+/g, '') // preserve latin, arabic, and amharic characters
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return slug || `article-${Date.now()}`;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

const CreateArticleRouteSchema = z.object({
  articleType: ArticleTypeSchema,
  topicId: z.string().min(1, 'Topic ID is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  language: ArticleLanguageSchema,
  title: z.string().min(3, 'Title must be at least 3 characters'),
});

const PatchTranslationSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.record(z.any()).optional(),
  seo: z
    .object({
      metaTitle: z.string().default(''),
      metaDescription: z.string().default(''),
    })
    .optional(),
});

const ReviewTranslationSchema = z.object({
  decision: z.enum(['approve', 'request_changes']),
  reviewNotes: z.string().optional(),
});

// GET /api/articles/search?q=...&language=en|am — Internal linking search endpoint (Prompt 10 §12-20)
articlesRouter.get(
  '/search',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = String(req.query.q || '').trim();
      const language = (req.query.language as string) || 'en';

      if (!q) {
        res.json({ results: [] });
        return;
      }

      const searchFilter: Record<string, any> = {
        status: 'published',
        language,
        title: { $regex: q, $options: 'i' },
      };

      const translations = await ArticleTranslation.find(searchFilter)
        .limit(10)
        .populate<{ articleId: any }>('articleId', 'category articleType coverImage')
        .lean();

      const results = translations.map((t) => ({
        articleId: t.articleId?._id ? String(t.articleId._id) : String(t.articleId),
        translationId: String(t._id),
        title: t.title,
        category: t.articleId?.category || 'General',
        slug: t.slug,
        language: t.language,
      }));

      res.json({ results });
    } catch (error) {
      next(error);
    }
  }
);

// 1. POST /api/articles — Create Article shell + initial ArticleTranslation
articlesRouter.post(
  '/',
  requireAuth,
  requireRole('contributor', 'super_admin'),
  validateBody(CreateArticleRouteSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { articleType, topicId, category, tags, language, title } = req.body;
      const userId = req.user!.userId;

      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        res.status(400).json({ error: 'Invalid topic ID' });
        return;
      }
      const topicExists = await Topic.findById(topicId);
      if (!topicExists) {
        res.status(404).json({ error: 'Topic not found' });
        return;
      }

      const newArticle = new Article({
        topicId: new mongoose.Types.ObjectId(topicId),
        category,
        tags: tags || [],
        authors: [{ userId: new mongoose.Types.ObjectId(userId), role: 'author' }],
        articleType,
      });
      await newArticle.save();

      const emptyTipTapContent = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };

      const initialSlug = slugify(title);
      const newTranslation = new ArticleTranslation({
        articleId: newArticle._id,
        language,
        title,
        slug: initialSlug,
        content: emptyTipTapContent,
        status: 'draft',
        authorId: new mongoose.Types.ObjectId(userId),
        versionHistory: [
          {
            editorId: new mongoose.Types.ObjectId(userId),
            timestamp: new Date(),
            summary: 'Initial draft created',
          },
        ],
      });
      await newTranslation.save();

      res.status(201).json({
        message: 'Article created successfully',
        article: newArticle,
        translation: newTranslation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 2. GET /api/articles/:articleId/translations/:language — Fetch translation for editing
articlesRouter.get(
  '/:articleId/translations/:language',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const language = getParam(req.params, 'language');
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const translation = await ArticleTranslation.findOne({
        articleId: new mongoose.Types.ObjectId(articleId),
        language,
      });

      if (!translation) {
        res.status(404).json({ error: 'Translation not found' });
        return;
      }

      const isAuthor = translation.authorId.toString() === userId;
      const isSuperAdmin = userRole === 'super_admin';

      if (!isAuthor && !isSuperAdmin) {
        res.status(403).json({ error: 'Access denied: You are not authorized to view this draft' });
        return;
      }

      res.json({ translation });
    } catch (error) {
      next(error);
    }
  }
);

// 3. PATCH /api/articles/:articleId/translations/:language — Update/Autosave translation
articlesRouter.patch(
  '/:articleId/translations/:language',
  requireAuth,
  validateBody(PatchTranslationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const language = getParam(req.params, 'language');
      const { title, content, seo } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const translation = await ArticleTranslation.findOne({
        articleId: new mongoose.Types.ObjectId(articleId),
        language,
      });

      if (!translation) {
        res.status(404).json({ error: 'Translation not found' });
        return;
      }

      const isAuthor = translation.authorId.toString() === userId;
      const isSuperAdmin = userRole === 'super_admin';

      if (!isAuthor && !isSuperAdmin) {
        res.status(403).json({ error: 'Access denied: You are not authorized to edit this translation' });
        return;
      }

      if (translation.status === 'published' && !isSuperAdmin) {
        res.status(403).json({ error: 'Published translations can only be modified by Super Admins' });
        return;
      }

      if (title && title !== translation.title) {
        translation.title = title;
        translation.slug = slugify(title);
      }

      if (content) {
        translation.content = content;
      }

      if (seo !== undefined) {
        translation.seo = seo;
      }

      translation.versionHistory.push({
        editorId: new mongoose.Types.ObjectId(userId),
        timestamp: new Date(),
        summary: 'Autosaved edit',
      });

      await translation.save();

      // Wire syncArticleLinks per Prompt 10 §22-26
      await syncArticleLinks(translation.articleId, translation.content).catch((err) => {
        console.error('[ArticleLink Sync] Error updating link graph:', err);
      });

      res.json({
        message: 'Translation updated successfully',
        translation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 4. POST /api/articles/:articleId/translations/:language/submit — Submit for review
articlesRouter.post(
  '/:articleId/translations/:language/submit',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const language = getParam(req.params, 'language');
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const translation = await ArticleTranslation.findOne({
        articleId: new mongoose.Types.ObjectId(articleId),
        language,
      });

      if (!translation) {
        res.status(404).json({ error: 'Translation not found' });
        return;
      }

      const isAuthor = translation.authorId.toString() === userId;
      const isSuperAdmin = userRole === 'super_admin';

      if (!isAuthor && !isSuperAdmin) {
        res.status(403).json({ error: 'Access denied: You can only submit your own content' });
        return;
      }

      if (translation.status !== 'draft' && translation.status !== 'changes_requested') {
        res.status(400).json({
          error: `Cannot submit translation with status '${translation.status}'. Only draft or changes_requested can be submitted.`,
        });
        return;
      }

      translation.status = 'in_review';
      translation.versionHistory.push({
        editorId: new mongoose.Types.ObjectId(userId),
        timestamp: new Date(),
        summary: 'Submitted for review',
      });

      await translation.save();

      res.json({
        message: 'Translation submitted for review',
        translation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 5. POST /api/articles/:articleId/translations/:language/review — Super Admin Review
articlesRouter.post(
  '/:articleId/translations/:language/review',
  requireAuth,
  requireRole('super_admin'),
  validateBody(ReviewTranslationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const language = getParam(req.params, 'language');
      const { decision, reviewNotes } = req.body;
      const userId = req.user!.userId;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const translation = await ArticleTranslation.findOne({
        articleId: new mongoose.Types.ObjectId(articleId),
        language,
      });

      if (!translation) {
        res.status(404).json({ error: 'Translation not found' });
        return;
      }

      if (decision === 'approve') {
        translation.status = 'published';
        translation.publishedAt = new Date();
        translation.reviewNotes = reviewNotes || null;
        translation.versionHistory.push({
          editorId: new mongoose.Types.ObjectId(userId),
          timestamp: new Date(),
          summary: 'Approved & Published by Super Admin',
        });
      } else if (decision === 'request_changes') {
        if (!reviewNotes || reviewNotes.trim() === '') {
          res.status(400).json({ error: 'reviewNotes are required when requesting changes' });
          return;
        }
        translation.status = 'changes_requested';
        translation.reviewNotes = reviewNotes;
        translation.versionHistory.push({
          editorId: new mongoose.Types.ObjectId(userId),
          timestamp: new Date(),
          summary: `Changes requested by Super Admin: ${reviewNotes}`,
        });
      }

      await translation.save();

      // Sync links upon publication as well
      await syncArticleLinks(translation.articleId, translation.content).catch((err) => {
        console.error('[ArticleLink Sync] Error updating link graph on review:', err);
      });

      res.json({
        message: `Translation review complete: ${decision}`,
        translation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 6. DELETE /api/articles/:articleId/translations/:language — Delete draft translation
articlesRouter.delete(
  '/:articleId/translations/:language',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const language = getParam(req.params, 'language');
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const translation = await ArticleTranslation.findOne({
        articleId: new mongoose.Types.ObjectId(articleId),
        language,
      });

      if (!translation) {
        res.status(404).json({ error: 'Translation not found' });
        return;
      }

      const isAuthor = translation.authorId.toString() === userId;
      const isSuperAdmin = userRole === 'super_admin';

      if (!isAuthor && !isSuperAdmin) {
        res.status(403).json({ error: 'Access denied: You can only delete your own draft' });
        return;
      }

      if (translation.status !== 'draft' && translation.status !== 'changes_requested') {
        res.status(400).json({
          error: 'Only draft or changes_requested translations can be deleted. Published content must be archived.',
        });
        return;
      }

      await translation.deleteOne();

      res.json({ message: 'Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// 7. GET /api/articles/:articleId/preview — Hover preview data with language fallback
articlesRouter.get(
  '/:articleId/preview',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = getParam(req.params, 'articleId');
      const requestedLang = (req.query.language as string) || 'en';

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }

      const article = await Article.findById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      let translation = await ArticleTranslation.findOne({
        articleId: article._id,
        language: requestedLang,
        status: 'published',
      });

      if (!translation) {
        translation = await ArticleTranslation.findOne({
          articleId: article._id,
          status: 'published',
        });
      }

      if (!translation) {
        res.status(404).json({ error: 'No published translation available for preview' });
        return;
      }

      res.json({
        title: translation.title,
        description: translation.seo?.metaDescription || '',
        coverImage: article.coverImage || null,
        category: article.category,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 8. GET /api/articles — List articles with filters
articlesRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, articleType, authorId, topicId, language } = req.query;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const skip = (page - 1) * limit;

      const articleFilter: Record<string, any> = {};
      if (articleType) articleFilter.articleType = articleType;
      if (topicId && mongoose.Types.ObjectId.isValid(topicId as string)) {
        articleFilter.topicId = new mongoose.Types.ObjectId(topicId as string);
      }
      if (authorId && mongoose.Types.ObjectId.isValid(authorId as string)) {
        articleFilter['authors.userId'] = new mongoose.Types.ObjectId(authorId as string);
      }

      const articles = await Article.find(articleFilter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const articleIds = articles.map((a) => a._id);

      const translationFilter: Record<string, any> = {
        articleId: { $in: articleIds },
      };
      if (status) translationFilter.status = status;
      if (language) translationFilter.language = language;

      const translations = await ArticleTranslation.find(translationFilter).lean();

      const total = await Article.countDocuments(articleFilter);

      res.json({
        articles,
        translations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default articlesRouter;

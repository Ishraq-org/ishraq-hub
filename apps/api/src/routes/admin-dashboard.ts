import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Article } from '../models/Article.js';
import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { Topic } from '../models/Topic.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminDashboardRouter = Router();

// GET /api/admin/dashboard-stats — Counts for super admin overview (Prompt 12 §19-26)
adminDashboardRouter.get(
  '/dashboard-stats',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [totalUsers, totalArticles, pendingReviewCount, totalTopics] = await Promise.all([
        User.countDocuments(),
        Article.countDocuments(),
        ArticleTranslation.countDocuments({ status: 'in_review' }),
        Topic.countDocuments(),
      ]);

      res.json({
        totalUsers,
        totalArticles,
        pendingReviewCount,
        totalTopics,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/activity-feed — Derived recent activity feed (Prompt 12 §28-36)
adminDashboardRouter.get(
  '/activity-feed',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [recentTranslations, recentUsers] = await Promise.all([
        ArticleTranslation.find()
          .sort({ updatedAt: -1 })
          .limit(10)
          .populate<{ authorId: any }>('authorId', 'name email')
          .lean(),
        User.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('name email role createdAt')
          .lean(),
      ]);

      const articleEvents = recentTranslations.map((t: any) => ({
        id: `article-${t._id}`,
        type: 'article' as const,
        action:
          t.status === 'in_review'
            ? 'Submitted for Review'
            : t.status === 'published'
            ? 'Published'
            : t.status === 'changes_requested'
            ? 'Changes Requested'
            : 'Draft Updated',
        title: t.title,
        actorName: t.authorId?.name || 'Contributor',
        timestamp: t.updatedAt,
        status: t.status,
        articleId: String(t.articleId),
        language: t.language,
      }));

      const userEvents = recentUsers.map((u: any) => ({
        id: `user-${u._id}`,
        type: 'user' as const,
        action: 'New User Registered',
        title: u.name,
        actorName: u.email,
        timestamp: u.createdAt,
        role: u.role,
      }));

      // Merge both lists by timestamp descending and take top ~15 combined
      const mergedFeed = [...articleEvents, ...userEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      res.json({ feed: mergedFeed });
    } catch (error) {
      next(error);
    }
  }
);

export default adminDashboardRouter;

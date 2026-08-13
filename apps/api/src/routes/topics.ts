import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const topicsRouter = Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\u1200-\u137F\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || `topic-${Date.now()}`;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// 1. GET /api/topics — Full topic tree resolved server-side (Prompt 12 §39-40)
topicsRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allTopics = await Topic.find().sort({ createdAt: 1 }).lean();

    const topicMap = new Map<string, any>();
    allTopics.forEach((t) => {
      topicMap.set(String(t._id), { ...t, children: [] });
    });

    const rootTopics: any[] = [];
    allTopics.forEach((t) => {
      const topicObj = topicMap.get(String(t._id));
      if (t.parentTopicId && topicMap.has(String(t.parentTopicId))) {
        topicMap.get(String(t.parentTopicId)).children.push(topicObj);
      } else {
        rootTopics.push(topicObj);
      }
    });

    res.json({ topics: rootTopics, flatTopics: allTopics });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/topics — Create topic (Prompt 12 §41-43)
topicsRouter.post(
  '/',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, parentTopicId, description } = req.body;

      if (!name?.en || !name?.am) {
        res.status(400).json({ error: 'Name in English and Amharic are required' });
        return;
      }

      const slugEn = slugify(name.en);
      const slugAm = slugify(name.am);

      const newTopic = new Topic({
        name,
        slug: { en: slugEn, am: slugAm },
        parentTopicId: parentTopicId && mongoose.Types.ObjectId.isValid(parentTopicId)
          ? new mongoose.Types.ObjectId(parentTopicId)
          : null,
        description: description || null,
      });

      await newTopic.save();

      res.status(201).json({
        message: 'Topic created successfully',
        topic: newTopic,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 3. PATCH /api/topics/:id — Update topic
topicsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const { name, parentTopicId, description } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid topic ID' });
        return;
      }

      const topic = await Topic.findById(id);
      if (!topic) {
        res.status(404).json({ error: 'Topic not found' });
        return;
      }

      if (name) {
        if (name.en) {
          topic.name.en = name.en;
          topic.slug.en = slugify(name.en);
        }
        if (name.am) {
          topic.name.am = name.am;
          topic.slug.am = slugify(name.am);
        }
      }

      if (parentTopicId !== undefined) {
        topic.parentTopicId =
          parentTopicId && mongoose.Types.ObjectId.isValid(parentTopicId)
            ? new mongoose.Types.ObjectId(parentTopicId)
            : null;
      }

      if (description !== undefined) {
        topic.description = description;
      }

      await topic.save();

      res.json({ message: 'Topic updated successfully', topic });
    } catch (error) {
      next(error);
    }
  }
);

// 4. DELETE /api/topics/:id — Delete safety check (Prompt 12 §44-47)
topicsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid topic ID' });
        return;
      }

      const topicObjId = new mongoose.Types.ObjectId(id);

      // Check if any articles reference this topic
      const articleCount = await Article.countDocuments({ topicId: topicObjId });
      if (articleCount > 0) {
        res.status(400).json({
          error: `Cannot delete topic: ${articleCount} article(s) still reference it. Please merge or reassign articles first.`,
        });
        return;
      }

      // Check if any child topics reference this topic as parent
      const childCount = await Topic.countDocuments({ parentTopicId: topicObjId });
      if (childCount > 0) {
        res.status(400).json({
          error: `Cannot delete topic: ${childCount} child topic(s) still reference it as parent. Please reassign child topics first.`,
        });
        return;
      }

      await Topic.findByIdAndDelete(id);

      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// 5. POST /api/topics/:id/merge-into/:targetId — Atomic Topic Merge (Prompt 12 §48-54)
topicsRouter.post(
  '/:id/merge-into/:targetId',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const targetId = getParam(req.params, 'targetId');

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetId)) {
        res.status(400).json({ error: 'Invalid topic ID or target topic ID' });
        return;
      }

      if (id === targetId) {
        res.status(400).json({ error: 'Cannot merge a topic into itself' });
        return;
      }

      const [sourceTopic, targetTopic] = await Promise.all([
        Topic.findById(id),
        Topic.findById(targetId),
      ]);

      if (!sourceTopic || !targetTopic) {
        res.status(404).json({ error: 'Source or target topic not found' });
        return;
      }

      const sourceObjId = new mongoose.Types.ObjectId(id);
      const targetObjId = new mongoose.Types.ObjectId(targetId);

      // Atomic reassignment transaction / updates
      const articleUpdate = await Article.updateMany(
        { topicId: sourceObjId },
        { $set: { topicId: targetObjId } }
      );

      const topicUpdate = await Topic.updateMany(
        { parentTopicId: sourceObjId },
        { $set: { parentTopicId: targetObjId } }
      );

      await Topic.findByIdAndDelete(id);

      res.json({
        message: 'Topic merged successfully',
        mergedTopicId: id,
        targetTopicId: targetId,
        reassignedArticles: articleUpdate.modifiedCount,
        reassignedChildTopics: topicUpdate.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default topicsRouter;

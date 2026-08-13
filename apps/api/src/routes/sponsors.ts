import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Sponsor } from '../models/Sponsor.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const sponsorsRouter = Router();

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// 1. GET /api/sponsors — Public endpoint returning all sponsors (Prompt 15 §40-42)
sponsorsRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 }).lean();

    // Group by tier order: partner -> sponsor -> contributor
    const tierOrder: Record<string, number> = { partner: 1, sponsor: 2, contributor: 3 };
    sponsors.sort((a, b) => (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99));

    res.json({ sponsors });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/sponsors — Create sponsor (Admin only)
sponsorsRouter.post(
  '/',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, logoUrl, websiteUrl, tier } = req.body;

      if (!name || !logoUrl) {
        res.status(400).json({ error: 'Name and logo URL are required' });
        return;
      }

      const newSponsor = new Sponsor({
        name,
        logoUrl,
        websiteUrl: websiteUrl || null,
        tier: tier && ['partner', 'sponsor', 'contributor'].includes(tier) ? tier : 'sponsor',
      });

      await newSponsor.save();

      res.status(201).json({
        message: 'Sponsor created successfully',
        sponsor: newSponsor,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 3. PATCH /api/sponsors/:id — Update sponsor (Admin only)
sponsorsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const { name, logoUrl, websiteUrl, tier } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid sponsor ID' });
        return;
      }

      const sponsor = await Sponsor.findById(id);
      if (!sponsor) {
        res.status(404).json({ error: 'Sponsor not found' });
        return;
      }

      if (name) sponsor.name = name;
      if (logoUrl) sponsor.logoUrl = logoUrl;
      if (websiteUrl !== undefined) sponsor.websiteUrl = websiteUrl || null;
      if (tier && ['partner', 'sponsor', 'contributor'].includes(tier)) sponsor.tier = tier;

      await sponsor.save();

      res.json({ message: 'Sponsor updated successfully', sponsor });
    } catch (error) {
      next(error);
    }
  }
);

// 4. DELETE /api/sponsors/:id — Delete sponsor (Admin only)
sponsorsRouter.delete(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid sponsor ID' });
        return;
      }

      await Sponsor.findByIdAndDelete(id);

      res.json({ message: 'Sponsor deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default sponsorsRouter;

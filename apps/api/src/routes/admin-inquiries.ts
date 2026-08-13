import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Inquiry } from '../models/Inquiry.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminInquiriesRouter = Router();

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// 1. GET /api/admin/inquiries — Fetch inquiries list (Super Admin only, Prompt 16 §60-67)
adminInquiriesRouter.get(
  '/',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const skip = (page - 1) * limit;

      const [inquiries, total] = await Promise.all([
        Inquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Inquiry.countDocuments(),
      ]);

      res.json({
        inquiries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// 2. PATCH /api/admin/inquiries/:id/status — Mark inquiry as reviewed (Super Admin only)
adminInquiriesRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid inquiry ID' });
        return;
      }

      if (!['new', 'reviewed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be "new" or "reviewed"' });
        return;
      }

      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      inquiry.status = status;
      await inquiry.save();

      res.json({ message: 'Inquiry status updated successfully', inquiry });
    } catch (error) {
      next(error);
    }
  }
);

export default adminInquiriesRouter;

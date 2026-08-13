import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { UserRoleSchema } from '@ishraq/shared-types';

export const adminUsersRouter = Router();

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// GET /api/admin/users — Paginated user search and filter (Prompt 12 §56-58)
adminUsersRouter.get(
  '/',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, isBanned, q } = req.query;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '15', 10);
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};

      if (role && ['member', 'contributor', 'super_admin'].includes(role as string)) {
        filter.role = role;
      }

      if (isBanned !== undefined && isBanned !== '') {
        filter.isBanned = isBanned === 'true';
      }

      if (q && String(q).trim()) {
        const queryStr = String(q).trim();
        filter.$or = [
          { name: { $regex: queryStr, $options: 'i' } },
          { email: { $regex: queryStr, $options: 'i' } },
        ];
      }

      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash')
        .lean();

      const total = await User.countDocuments(filter);

      res.json({
        users,
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

// PATCH /api/admin/users/:id/role — Role promotion/demotion (Prompt 12 §59-65)
adminUsersRouter.patch(
  '/:id/role',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const { role } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const parsedRole = UserRoleSchema.safeParse(role);
      if (!parsedRole.success) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.role = parsedRole.data;
      await user.save();

      res.json({
        message: `User role updated to '${user.role}'`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/users/:id/ban — Ban/Unban user with reason (Prompt 12 §66)
adminUsersRouter.patch(
  '/:id/ban',
  requireAuth,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const { isBanned, banReason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Prevent banning self
      if (String(user._id) === req.user!.userId) {
        res.status(400).json({ error: 'Cannot ban your own account' });
        return;
      }

      user.isBanned = Boolean(isBanned);
      user.banReason = isBanned ? banReason || 'Banned by Super Admin' : null;

      await user.save();

      res.json({
        message: user.isBanned ? `User '${user.email}' has been banned` : `User '${user.email}' unbanned`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
          banReason: user.banReason,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default adminUsersRouter;

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { UserRole } from '@ishraq/shared-types';

declare global {
  namespace Express {
    interface User {
      userId: string;
      role: UserRole;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined = req.cookies?.ishraq_session;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  try {
    const decoded = verifyToken(token);

    // Request-level banned check per Prompt 12 §11-15
    const userDoc = await User.findById(decoded.userId).select('isBanned banReason role');

    if (!userDoc) {
      res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
      return;
    }

    if (userDoc.isBanned) {
      res.status(403).json({
        error: `Account banned: ${userDoc.banReason || 'Violation of community policies'}`,
      });
      return;
    }

    // Keep req.user in sync with database role (handles instant role promotions)
    req.user = {
      userId: String(userDoc._id),
      role: userDoc.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};

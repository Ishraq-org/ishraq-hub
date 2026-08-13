import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

export const uploadsRouter = Router();

const UploadSignatureSchema = z.object({
  folder: z.enum(['covers', 'evidence', 'inline']),
});

// POST /api/uploads/signature — Issue signed Cloudinary permission slip (Prompt 13 §25-45)
uploadsRouter.post(
  '/signature',
  requireAuth,
  requireRole('contributor', 'super_admin'),
  validateBody(UploadSignatureSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder } = req.body;

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ishraq-hub';
      const apiKey = process.env.CLOUDINARY_API_KEY || '819283749182734';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mock_secret_key_12345';

      const timestamp = Math.floor(Date.now() / 1000);

      // Cloudinary signature formula: sort keys alphabetically, join key=val&, append secret, SHA-1 hex
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      res.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default uploadsRouter;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedSuperAdmin = async () => {
  console.log('--- Initializing Super Admin Seeding Script ---');

  const email = process.env.SEED_ADMIN_EMAIL || 'aymen@ishraqhub.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'SuperAdminSecret123!';
  const name = process.env.SEED_ADMIN_NAME || 'Aymen SuperAdmin';

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('[Seed] Warning: MONGO_URI is not set. Skipped direct DB seed.');
    return;
  }

  await connectDB();

  try {
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role !== 'super_admin') {
        existing.role = 'super_admin';
        await existing.save();
        console.log(`[Seed] Updated existing user ${email} to role "super_admin".`);
      } else {
        console.log(`[Seed] Super admin ${email} already exists.`);
      }
    } else {
      const superAdmin = new User({
        name,
        email,
        passwordHash: password,
        role: 'super_admin',
        emailVerified: true,
      });

      await superAdmin.save();
      console.log(`[Seed] Successfully created Super Admin user: ${email}`);
    }
  } catch (error) {
    console.error(`[Seed] Error creating Super Admin: ${(error as Error).message}`);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
};

if (process.argv[1]?.endsWith('seedSuperAdmin.ts') || process.argv[1]?.endsWith('seedSuperAdmin.js')) {
  seedSuperAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

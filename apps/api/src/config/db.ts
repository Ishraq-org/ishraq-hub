import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('[Database] Warning: MONGO_URI environment variable is not defined.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${(error as Error).message}`);
    // In production, handle connection retries or process termination appropriately
  }
};

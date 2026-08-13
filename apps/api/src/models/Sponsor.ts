import mongoose, { Schema, Document, Model } from 'mongoose';

export type SponsorTier = 'partner' | 'sponsor' | 'contributor';

export interface ISponsorDocument extends Document {
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  tier: SponsorTier;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema = new Schema<ISponsorDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: null,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['partner', 'sponsor', 'contributor'],
      default: 'sponsor',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Sponsor: Model<ISponsorDocument> =
  mongoose.models.Sponsor || mongoose.model<ISponsorDocument>('Sponsor', SponsorSchema);

export default Sponsor;

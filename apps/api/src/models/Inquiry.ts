import mongoose, { Schema, Document, Model } from 'mongoose';

export type InquiryStatus = 'new' | 'reviewed';

export interface IInquiryDocument extends Document {
  telegramUserId: string;
  telegramUsername?: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiryDocument>(
  {
    telegramUserId: {
      type: String,
      required: true,
      index: true,
    },
    telegramUsername: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed'],
      default: 'new',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Inquiry: Model<IInquiryDocument> =
  mongoose.models.Inquiry || mongoose.model<IInquiryDocument>('Inquiry', InquirySchema);

export default Inquiry;

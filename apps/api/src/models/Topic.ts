import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopicDocument extends Document {
  name: {
    en: string;
    am: string;
  };
  slug: {
    en: string;
    am: string;
  };
  parentTopicId?: mongoose.Types.ObjectId | null;
  description?: {
    en: string;
    am: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const MultiLangStringSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    am: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TopicSchema = new Schema<ITopicDocument>(
  {
    name: {
      type: MultiLangStringSchema,
      required: true,
    },
    slug: {
      type: MultiLangStringSchema,
      required: true,
    },
    parentTopicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
      index: true,
    },
    description: {
      type: MultiLangStringSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique Indexes for slugs per language
TopicSchema.index({ 'slug.en': 1 }, { unique: true });
TopicSchema.index({ 'slug.am': 1 }, { unique: true });

export const Topic: Model<ITopicDocument> =
  mongoose.models.Topic || mongoose.model<ITopicDocument>('Topic', TopicSchema);

export default Topic;

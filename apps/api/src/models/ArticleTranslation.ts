import mongoose, { Schema, Document, Model } from 'mongoose';
import { ArticleLanguage, ArticleStatus } from '@ishraq/shared-types';

export interface IVersionHistoryItem {
  editorId: mongoose.Types.ObjectId;
  timestamp: Date;
  summary: string;
}

export interface IArticleTranslationDocument extends Document {
  articleId: mongoose.Types.ObjectId;
  language: ArticleLanguage;
  title: string;
  slug: string;
  content: Record<string, any>;
  status: ArticleStatus;
  reviewNotes?: string | null;
  seo?: { metaTitle: string; metaDescription: string } | null;
  publishedAt?: Date | null;
  authorId: mongoose.Types.ObjectId;
  versionHistory: IVersionHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const VersionHistorySchema = new Schema<IVersionHistoryItem>(
  {
    editorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ArticleTranslationSchema = new Schema<IArticleTranslationDocument>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'am'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'in_review', 'changes_requested', 'published', 'archived'],
      default: 'draft',
      required: true,
    },
    reviewNotes: {
      type: String,
      default: null,
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionHistory: {
      type: [VersionHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Indexes
ArticleTranslationSchema.index({ articleId: 1, language: 1 }, { unique: true });
ArticleTranslationSchema.index({ language: 1, slug: 1 }, { unique: true });

export const ArticleTranslation: Model<IArticleTranslationDocument> =
  mongoose.models.ArticleTranslation ||
  mongoose.model<IArticleTranslationDocument>(
    'ArticleTranslation',
    ArticleTranslationSchema
  );

export default ArticleTranslation;

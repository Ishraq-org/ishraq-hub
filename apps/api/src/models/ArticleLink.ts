import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleLinkDocument extends Document {
  sourceArticleId: mongoose.Types.ObjectId;
  targetArticleId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ArticleLinkSchema = new Schema<IArticleLinkDocument>(
  {
    sourceArticleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    targetArticleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure single directional link uniqueness between two articles
ArticleLinkSchema.index(
  { sourceArticleId: 1, targetArticleId: 1 },
  { unique: true }
);

export const ArticleLink: Model<IArticleLinkDocument> =
  mongoose.models.ArticleLink ||
  mongoose.model<IArticleLinkDocument>('ArticleLink', ArticleLinkSchema);

export default ArticleLink;

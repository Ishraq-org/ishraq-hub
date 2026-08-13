import mongoose, { Schema, Document, Model } from 'mongoose';
import { ArticleType } from '@ishraq/shared-types';

export interface IArticleAuthor {
  userId: mongoose.Types.ObjectId;
  role: string;
}

export interface IArticleDocument extends Document {
  topicId: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  authors: IArticleAuthor[];
  coverImage?: { url: string; alt: string } | null;
  articleType: ArticleType;
  nextRelatedShubha?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleAuthorSchema = new Schema<IArticleAuthor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: 'author',
    },
  },
  { _id: false }
);

const ArticleSchema = new Schema<IArticleDocument>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    authors: {
      type: [ArticleAuthorSchema],
      required: true,
      validate: [
        (val: IArticleAuthor[]) => val.length > 0,
        'At least one author is required',
      ],
    },
    coverImage: {
      url: { type: String },
      alt: { type: String, default: '' },
    },
    articleType: {
      type: String,
      enum: ['shubha', 'term', 'general'],
      required: true,
      index: true,
    },
    nextRelatedShubha: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Article: Model<IArticleDocument> =
  mongoose.models.Article ||
  mongoose.model<IArticleDocument>('Article', ArticleSchema);

export default Article;

import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { ArticleLanguage } from '@ishraq/shared-types';

export const slugifyText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces & hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
};

export const generateUniqueSlug = async (
  title: string,
  language: ArticleLanguage,
  excludeTranslationId?: string
): Promise<string> => {
  const baseSlug = slugifyText(title) || 'untitled';
  let currentSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, any> = {
      language,
      slug: currentSlug,
    };

    if (excludeTranslationId) {
      query._id = { $ne: excludeTranslationId };
    }

    const existing = await ArticleTranslation.findOne(query).select('_id').lean();

    if (!existing) {
      return currentSlug;
    }

    counter++;
    currentSlug = `${baseSlug}-${counter}`;
  }
};

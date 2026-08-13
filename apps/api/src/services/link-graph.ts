import mongoose from 'mongoose';
import { ArticleLink } from '../models/ArticleLink.js';
import { TipTapDocument } from '@ishraq/shared-types';

/**
  * Recursively extracts all targetArticleIds from link marks in a TipTap JSON document
  */
export const extractLinkTargetsFromContent = (content: any): string[] => {
  const targetIds = new Set<string>();

  const traverse = (node: any) => {
    if (!node || typeof node !== 'object') return;

    // Check if current node has text marks
    if (Array.isArray(node.marks)) {
      for (const mark of node.marks) {
        if (mark && mark.type === 'link' && mark.targetArticleId) {
          targetIds.add(String(mark.targetArticleId));
        }
      }
    }

    // Traverse node content children
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  };

  traverse(content);
  return Array.from(targetIds);
};

/**
  * Synchronizes ArticleLink rows for a given source article to match its latest content links
  */
export const syncArticleLinks = async (
  sourceArticleId: string | mongoose.Types.ObjectId,
  content: TipTapDocument | any
): Promise<void> => {
  const sourceIdObj = new mongoose.Types.ObjectId(String(sourceArticleId));
  const targetArticleIds = extractLinkTargetsFromContent(content);

  // Convert target strings to ObjectIds, skipping self-links if any
  const validTargetIds = targetArticleIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id) && id !== String(sourceArticleId))
    .map((id) => new mongoose.Types.ObjectId(id));

  // Find existing links for this source article
  const existingLinks = await ArticleLink.find({ sourceArticleId: sourceIdObj });
  const existingTargetIdStrs = new Set(
    existingLinks.map((link) => link.targetArticleId.toString())
  );
  const newTargetIdStrs = new Set(validTargetIds.map((id) => id.toString()));

  // Determine links to remove
  const linksToRemove = existingLinks.filter(
    (link) => !newTargetIdStrs.has(link.targetArticleId.toString())
  );

  if (linksToRemove.length > 0) {
    const removeIds = linksToRemove.map((link) => link._id);
    await ArticleLink.deleteMany({ _id: { $in: removeIds } });
  }

  // Determine links to add
  const targetsToAdd = validTargetIds.filter(
    (targetId) => !existingTargetIdStrs.has(targetId.toString())
  );

  if (targetsToAdd.length > 0) {
    const newLinkDocs = targetsToAdd.map((targetId) => ({
      sourceArticleId: sourceIdObj,
      targetArticleId: targetId,
    }));
    await ArticleLink.insertMany(newLinkDocs, { ordered: false }).catch((err) => {
      // Ignore duplicate key errors if race condition occurs
      if (err.code !== 11000) throw err;
    });
  }
};

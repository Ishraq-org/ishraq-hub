import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';

export const checkTopicCycle = async (
  topicId: string | mongoose.Types.ObjectId,
  newParentTopicId: string | mongoose.Types.ObjectId | null
): Promise<boolean> => {
  if (!newParentTopicId) {
    return false;
  }

  const topicIdStr = String(topicId);
  let currentParentId: string | null = String(newParentTopicId);

  if (topicIdStr === currentParentId) {
    return true;
  }

  const visited = new Set<string>([topicIdStr]);

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      return true;
    }
    visited.add(currentParentId);

    const parentTopic: { parentTopicId?: mongoose.Types.ObjectId | null } | null =
      await Topic.findById(currentParentId).select('parentTopicId').lean();

    if (!parentTopic || !parentTopic.parentTopicId) {
      break;
    }
    currentParentId = String(parentTopic.parentTopicId);
  }

  return false;
};

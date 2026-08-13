import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';
import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { ArticleLink } from '../models/ArticleLink.js';
import { syncArticleLinks } from '../services/link-graph.js';
import { TipTapDocumentSchema, UserSchema, ArticleSchema } from '@ishraq/shared-types';

export const runSmokeTest = async () => {
  console.log('--- Starting Execution Prompt 02 Smoke Test ---');

  // 1. Validate Invalid TipTap Tree Rejection
  console.log('1. Testing invalid TipTap content rejection...');
  const invalidContent = {
    type: 'doc',
    content: [
      {
        type: 'quranVerse',
        surah: 1,
        // missing required 'ayah' field
        arabicText: 'الفاتحة',
        translation: 'The Opening',
        translationSource: 'Saheeh International',
      },
    ],
  };

  const validationResult = TipTapDocumentSchema.safeParse(invalidContent);
  if (!validationResult.success) {
    console.log('✓ Success: Invalid TipTap tree was correctly rejected by Zod schema validation!');
  } else {
    throw new Error('FAILED: Invalid TipTap content was unexpectedly accepted!');
  }

  // 2. Validate Article Refinement Rule (nextRelatedShubha only allowed for shubha type)
  console.log('2. Testing Article refinement validation...');
  const invalidArticleRefinement = ArticleSchema.safeParse({
    topicId: new mongoose.Types.ObjectId().toString(),
    category: 'Theology',
    authors: [{ userId: new mongoose.Types.ObjectId().toString(), role: 'author' }],
    articleType: 'term', // NOT shubha
    nextRelatedShubha: new mongoose.Types.ObjectId().toString(), // Should fail refinement
  });

  if (!invalidArticleRefinement.success) {
    console.log('✓ Success: Article refinement correctly rejected nextRelatedShubha on non-shubha type!');
  } else {
    throw new Error('FAILED: nextRelatedShubha on term article was unexpectedly accepted!');
  }

  // 3. Test In-Memory / Simulated DB Model Operations & Link Extraction
  console.log('3. Testing Link Graph sync logic with valid TipTap tree...');
  const targetArticleId = new mongoose.Types.ObjectId();
  const sourceArticleId = new mongoose.Types.ObjectId();

  const validContent = {
    type: 'doc',
    content: [
      {
        type: 'quranVerse',
        surah: 1,
        ayah: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        translationSource: 'Saheeh International',
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Link to target article',
            marks: [
              {
                type: 'link',
                targetArticleId: targetArticleId.toString(),
              },
            ],
          },
        ],
      },
    ],
  };

  const validDocParse = TipTapDocumentSchema.safeParse(validContent);
  if (!validDocParse.success) {
    throw new Error(`FAILED: Valid TipTap tree failed parsing: ${JSON.stringify(validDocParse.error)}`);
  }
  console.log('✓ Success: Valid TipTap tree with quranVerse & link mark parsed successfully!');

  // If connected to Mongo, test real model lifecycle & cleanup
  if (mongoose.connection.readyState === 1) {
    console.log('4. Performing database lifecycle test & cleanup...');
    const testUser = await User.create({
      name: 'Smoke Test User',
      email: `smoketest_${Date.now()}@example.com`,
      passwordHash: 'SuperSecret123!',
      role: 'super_admin',
    });

    const testTopic = await Topic.create({
      name: { en: 'Apologetics', am: 'እምነት ጥበቃ' },
      slug: { en: `apologetics-${Date.now()}`, am: `apologetics-am-${Date.now()}` },
    });

    const testArticle = await Article.create({
      topicId: testTopic._id,
      category: 'Refutations',
      authors: [{ userId: testUser._id, role: 'author' }],
      articleType: 'shubha',
    });

    const testTranslation = await ArticleTranslation.create({
      articleId: testArticle._id,
      language: 'en',
      title: 'Smoke Test Article Title',
      slug: `smoke-test-article-${Date.now()}`,
      content: validDocParse.data,
      authorId: testUser._id,
    });

    await syncArticleLinks(testArticle._id, testTranslation.content);

    const createdLinks = await ArticleLink.find({ sourceArticleId: testArticle._id });
    if (createdLinks.length === 1 && createdLinks[0].targetArticleId.toString() === targetArticleId.toString()) {
      console.log('✓ Success: syncArticleLinks created exact expected ArticleLink row in database!');
    } else {
      throw new Error(`FAILED: Expected 1 ArticleLink row, got ${createdLinks.length}`);
    }

    // Cleanup
    await ArticleLink.deleteMany({ sourceArticleId: testArticle._id });
    await ArticleTranslation.findByIdAndDelete(testTranslation._id);
    await Article.findByIdAndDelete(testArticle._id);
    await Topic.findByIdAndDelete(testTopic._id);
    await User.findByIdAndDelete(testUser._id);
    console.log('✓ Success: Database smoke test data cleaned up successfully!');
  } else {
    console.log('ℹ Note: Database connection not active; skipped direct MongoDB insertion (Zod + schema logic verified).');
  }

  console.log('--- Execution Prompt 02 Smoke Test PASSED ---');
};

// Execute if run directly
if (process.argv[1]?.endsWith('smoke-test.ts') || process.argv[1]?.endsWith('smoke-test.js')) {
  runSmokeTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

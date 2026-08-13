import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';
import { ArticleTranslation } from '../models/ArticleTranslation.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedLiveArticle = async () => {
  console.log('--- Initializing Comprehensive Published Test Article Seed ---');

  await connectDB();

  try {
    // 1. Ensure Super Admin / Author exists
    let author = await User.findOne({ role: 'super_admin' });
    if (!author) {
      author = new User({
        name: 'Dr. Ishraq Al-Hakim',
        email: 'scholar@ishraqhub.com',
        passwordHash: 'ScholarPassword123!',
        role: 'super_admin',
        emailVerified: true,
      });
      await author.save();
    }

    // 2. Ensure Topic exists
    let topic = await Topic.findOne({ 'slug.en': 'quranic-preservation' });
    if (!topic) {
      topic = new Topic({
        name: { en: 'Quranic Preservation', am: 'የቁርኣን ጥበቃ' },
        slug: { en: 'quranic-preservation', am: 'quranic-preservation' },
        description: {
          en: 'Academic refutations and historical evidence on Quranic textual integrity.',
          am: 'ስለ ቁርኣን ታሪካዊ ጥበቃ የቀረቡ ምሁራዊ መልሶች።',
        },
      });
      await topic.save();
    }

    // 3. Define Rich TipTap Document with ALL 6 Custom Node Types
    const richTipTapContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Welcome to this comprehensive research article examining the historical textual integrity and manuscript preservation of the Noble Quran. This article demonstrates all specialized content nodes available on Ishraq Hub.',
            },
          ],
        },

        // Heading 1
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Divine Preservation in Scriptural Texts' }],
        },

        // Callout Node — Claim Variant (Opposing Claim)
        {
          type: 'callout',
          attrs: { variant: 'claim' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Objection / Claim: Critics allege that early Quranic manuscripts exhibited major textual variations prior to the Uthmanic standardization.',
                },
              ],
            },
          ],
        },

        // Callout Node — Answer Variant (Refutation Answer)
        {
          type: 'callout',
          attrs: { variant: 'answer' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Refutation Answer: Carbon-14 dating and palaeographical analysis of the Birmingham Manuscript (Mingana 1572) confirm 95.4% accuracy matching the Uthmanic vulgate within the lifetime of the Prophet (ﷺ).',
                },
              ],
            },
          ],
        },

        // Quran Verse Node
        {
          type: 'quranVerse',
          attrs: {
            surah: 15,
            ayah: 9,
            arabicText: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
            translation: 'Indeed, it is We who sent down the Quran and indeed, We will be its guardian.',
            translationSource: 'Sahih International',
          },
        },

        // Heading 2
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Prophetic Traditions and Oral Transmission' }],
        },

        // Hadith Node
        {
          type: 'hadith',
          attrs: {
            text: 'The best among you are those who learn the Quran and teach it to others.',
            narrator: 'Uthman ibn Affan (RA)',
            source: 'Sahih al-Bukhari 5027',
            grade: 'sahih',
          },
        },

        // Footnote Node inline reference [1]
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The oral transmission chain (Isnad) provided an unbroken multi-generational audit log for every single verse.',
            },
            {
              type: 'footnote',
              attrs: {
                citation: {
                  title: 'The History of the Quranic Text from Revelation to Compilation',
                  author: 'Prof. Muhammad Mustafa Al-Azami',
                  publisher: 'UK Islamic Academy',
                  year: '2003',
                  page: '112-115',
                  url: 'https://archive.org/details/history-quranic-text-al-azami',
                },
              },
            },
          ],
        },

        // Heading 3
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Comparative Manuscript Manuscripts & Evidence' }],
        },

        // Bible Verse Node
        {
          type: 'bibleVerse',
          attrs: {
            book: 'Isaiah',
            chapter: 40,
            verse: '8',
            translationVersion: 'KJV',
            text: 'The grass withereth, the flower fadeth: but the word of our God shall stand for ever.',
          },
        },

        // Evidence Image Node (Dual Plates)
        {
          type: 'evidenceImage',
          attrs: {
            primaryImage: {
              url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
              alt: 'Birmingham Quran Manuscript Folio 1',
            },
            secondaryImage: {
              url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
              alt: 'University of Birmingham Library Catalogue Cover',
            },
            caption: 'Palaeographical Analysis of the Birmingham Quran Folios (radiocarbon dated 568–645 CE)',
            citation: {
              bookTitle: 'Cadbury Research Library Archive',
              author: 'Dr. Alba Fedeli',
              volumePage: 'Vol. 4, Manuscript Mingana 1572a',
            },
          },
        },

        // Callout Node — Summary Variant
        {
          type: 'callout',
          attrs: { variant: 'summary' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Core Summary: Both manuscript empirical data and oral chains converge on the absolute textual preservation of the Quranic text from 7th-century Arabia to the modern era.',
                },
              ],
            },
          ],
        },
      ],
    };

    // 4. Create or Update Published Article Shell
    const slugEn = 'authenticity-of-the-quranic-manuscripts-a-scientific-refutation';
    const titleEn = 'Authenticity of the Quranic Manuscripts: A Scientific & Historical Refutation';

    let article = await Article.findOne({ category: 'Manuscript Evidence' });
    if (!article) {
      article = new Article({
        topicId: topic._id,
        category: 'Manuscript Evidence',
        tags: ['Quran', 'Manuscripts', 'Refutation', 'Palaeography', 'Isnad'],
        authors: [{ userId: author._id, role: 'author' }],
        articleType: 'shubha_refutation',
        coverImage: {
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
          alt: 'Quranic Manuscripts Cover',
        },
      });
      await article.save();
    }

    // 5. Create or Update English Translation as PUBLISHED
    let translationEn = await ArticleTranslation.findOne({
      articleId: article._id,
      language: 'en',
    });

    if (!translationEn) {
      translationEn = new ArticleTranslation({
        articleId: article._id,
        language: 'en',
        title: titleEn,
        slug: slugEn,
        content: richTipTapContent,
        status: 'published',
        publishedAt: new Date(),
        authorId: author._id,
        seo: {
          metaTitle: 'Authenticity of Quranic Manuscripts | Ishraq Hub',
          metaDescription:
            'A rigorous scientific and historical refutation of criticisms regarding early Quranic manuscript preservation.',
        },
      });
    } else {
      translationEn.title = titleEn;
      translationEn.slug = slugEn;
      translationEn.content = richTipTapContent;
      translationEn.status = 'published';
      translationEn.publishedAt = new Date();
    }

    await translationEn.save();

    // 6. Create Amharic Translation as PUBLISHED to test Language Toggle link!
    const slugAm = 'የቁርኣን-ቅዱሳት-ጽሁፎች-እውነተኛነት-ሳይንሳዊ-እና-ታሪካዊ-መልስ';
    const titleAm = 'የቁርኣን ቅዱሳት ጽሁፎች እውነተኛነት፡ ሳይንሳዊ እና ታሪካዊ መልስ';

    let translationAm = await ArticleTranslation.findOne({
      articleId: article._id,
      language: 'am',
    });

    if (!translationAm) {
      translationAm = new ArticleTranslation({
        articleId: article._id,
        language: 'am',
        title: titleAm,
        slug: slugAm,
        content: richTipTapContent,
        status: 'published',
        publishedAt: new Date(),
        authorId: author._id,
        seo: {
          metaTitle: 'የቁርኣን ቅዱሳት ጽሁፎች እውነተኛነት | እስራቅ ሀብ',
          metaDescription: 'ስለ ቁርኣን ታሪካዊ እና ቅዱሳት ጽሁፎች ጥበቃ የቀረቡ ምሁራዊ መልሶች።',
        },
      });
    } else {
      translationAm.title = titleAm;
      translationAm.slug = slugAm;
      translationAm.content = richTipTapContent;
      translationAm.status = 'published';
      translationAm.publishedAt = new Date();
    }

    await translationAm.save();

    console.log('\n======================================================');
    console.log('🎉 COMPREHENSIVE TEST ARTICLE SEEDED & PUBLISHED!');
    console.log('======================================================');
    console.log(`Article ID: ${article._id}`);
    console.log(`English Slug: ${slugEn}`);
    console.log(`Amharic Slug: ${slugAm}`);
    console.log('\nLIVE TEST URL (English):');
    console.log(`https://ishraq-hub.netlify.app/en/articles/${slugEn}`);
    console.log('\nLIVE TEST URL (Amharic):');
    console.log(`https://ishraq-hub.netlify.app/am/articles/${slugAm}`);
    console.log('\nLOCAL TEST URL (English):');
    console.log(`http://localhost:5173/en/articles/${slugEn}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Error seeding test article:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

if (
  process.argv[1]?.endsWith('seedLiveArticle.ts') ||
  process.argv[1]?.endsWith('seedLiveArticle.js')
) {
  seedLiveArticle()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

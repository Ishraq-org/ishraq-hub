🌐 Ishraq Multilingual Article System — Complete Design

You're absolutely right! This is a critical feature for a platform serving the Ethiopian Ummah and the global Islamic community. Amharic and English are both essential, and we need a seamless experience for switching between them.

Let me design the complete multilingual system.

───

📊 Core Philosophy

"One Knowledge Item — Multiple Language Versions"

┌─────────────────────────────────────────────────────────┐
│                 KNOWLEDGE ITEM                          │
│                                                         │
│   ┌─────────────────┐     ┌─────────────────┐          │
│   │  ENGLISH        │     │  AMHARIC        │          │
│   │  Version        │     │  Version        │          │
│   │                 │     │                 │          │
│   │  Title          │     │  ርዕስ            │          │
│   │  Content        │     │  ይዘት            │          │
│   │  Description    │     │  መግለጫ           │          │
│   │  Slug           │     │  ስም              │          │
│   └─────────────────┘     └─────────────────┘          │
│                                                         │
│   Shared: Topic, Tags, Images, Video, Author           │
│                                                         │
└─────────────────────────────────────────────────────────┘


───

🗄️ Data Model for Multilingual Articles

1. Article (Base) Model

typescript
interface IArticle {
  _id: ObjectId;
  
  // Language versions
  translations: {
    en: IArticleTranslation;
    am: IArticleTranslation;
  };
  
  // Common fields (shared across languages)
  topicId: ObjectId;
  subtopicIds: ObjectId[];
  coverImage: string;
  images: {
    url: string;
    caption: { en: string; am: string };
    alt: { en: string; am: string };
    position: 'left' | 'center' | 'right' | 'full';
  }[];
  tags: string[]; // Can be multilingual tags system
  keywords: { en: string[]; am: string[] };
  authors: {
    userId: ObjectId;
    name: string;
    role: 'primary' | 'co-author' | 'contributor';
    bio: { en?: string; am?: string };
  }[];
  readingTime: { en: number; am: number };
  
  // Responsibility (multilingual)
  disclaimer: { en: string; am: string };
  responsibilityNote: { en?: string; am?: string };
  
  // Status & Workflow (shared)
  status: 'draft' | 'review' | 'published' | 'archived' | 'scheduled';
  isFeatured: boolean;
  isPremium: boolean;
  
  // Publishing (shared)
  publishedAt?: Date;
  scheduledAt?: Date;
  lastEditedAt: Date;
  
  // Analytics (shared)
  views: number;
  uniqueViews: number;
  shares: number;
  bookmarks: number;
  
  // System (shared)
  createdBy: ObjectId;
  createdByRole: 'contributor' | 'author' | 'admin' | 'super_admin';
  reviewedBy?: ObjectId;
  approvedBy?: ObjectId;
  reviewComments: {
    reviewerId: ObjectId;
    comment: string;
    date: Date;
  }[];
  
  // Version history (per language)
  versionHistory: {
    language: 'en' | 'am';
    version: number;
    content: string;
    updatedBy: ObjectId;
    date: Date;
    changes: string;
  }[];
  
  // Language availability
  availableLanguages: ('en' | 'am')[];
  
  createdAt: Date;
  updatedAt: Date;
}


1. Article Translation Model

typescript
interface IArticleTranslation {
  // Language-specific fields
  title: string;
  slug: string; // Unique per language (e.g., "trinity" vs "ሥላሴ")
  description: string;
  content: string; // MDX in that language
  
  // Translation metadata
  isTranslationComplete: boolean;
  translationProgress: number; // 0-100
  translatorId?: ObjectId;
  translatorName?: string;
  translatedAt?: Date;
  lastReviewedAt?: Date;
  
  // SEO (per language)
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  
  // Language-specific tags
  tags: string[];
  
  // Language-specific keywords
  keywords: string[];
}


1. Alternate Approach: Separate Collections (Simpler)

If we want simpler queries, we can use separate documents:

typescript
// Article (base) - contains metadata and references
interface IArticle {
  _id: ObjectId;
  topicId: ObjectId;
  coverImage: string;
  tags: string[];
  authors: ObjectId[];
  status: string;
  // ... shared fields
}

// ArticleTranslation - one per language
interface IArticleTranslation {
  _id: ObjectId;
  articleId: ObjectId;
  language: 'en' | 'am';
  title: string;
  slug: string;
  description: string;
  content: string;
  // ... language-specific fields
}

// This is easier for queries like "get all English articles"


I recommend the separate collections approach for:

· Simpler queries
· Better performance
· Easier indexing
· Cleaner separation of concerns

───

🔄 Translation Workflow

1. Article Creation Flow (Multilingual)

┌─────────────────────────────────────────────────────────────┐
│               CREATE ARTICLE (Multilingual)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Create Base Article                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │  - Topic                                          │      │
│  │  - Tags                                           │      │
│  │  - Authors                                        │      │
│  │  - Cover Image                                    │      │
│  │  - Status: draft                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                          │                                  │
│                          ▼                                  │
│  Step 2: Add First Language Version                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │  - Language: English or Amharic                  │      │
│  │  - Title                                          │      │
│  │  - Slug (generated)                              │      │
│  │  - Description                                    │      │
│  │  - Content (full article)                        │      │
│  └──────────────────────────────────────────────────┘      │
│                          │                                  │
│                          ▼                                  │
│  Step 3: Add Second Language Version                       │
│  ┌──────────────────────────────────────────────────┐      │
│  │  - Language: Other language                     │      │
│  │  - Title (translated)                           │      │
│  │  - Slug (generated)                             │      │
│  │  - Description (translated)                     │      │
│  │  - Content (translated or waiting for review)   │      │
│  └──────────────────────────────────────────────────┘      │
│                          │                                  │
│                          ▼                                  │
│  Step 4: Submit for Review (optional)                      │
│                                                             │
│  Step 5: Publish                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘


1. Translation Management

typescript
// backend/services/TranslationService.ts

class TranslationService {
  // Create or update translation
  async saveTranslation(
    articleId: string,
    language: 'en' | 'am',
    data: TranslationData
  ) {
    const translation = await ArticleTranslation.findOneAndUpdate(
      { articleId, language },
      { ...data, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    // Update article's available languages
    await Article.findByIdAndUpdate(articleId, {
      $`addToSet: { availableLanguages: language }
    });
    
    return translation;
  }

  // Get translation with fallback
  async getTranslation(articleId: string, language: 'en' | 'am') {
    let translation = await ArticleTranslation.findOne({ 
      articleId, 
      language 
    });
    
    // If requested language not available, fallback to English
    if (!translation && language === 'am') {
      translation = await ArticleTranslation.findOne({
        articleId,
        language: 'en'
      });
    }
    
    return translation;
  }

  // Get all translations for article
  async getAllTranslations(articleId: string) {
    return await ArticleTranslation.find({ articleId });
  }

  // Check if translation is complete
  async isTranslationComplete(articleId: string, language: 'en' | 'am') {
    const translation = await ArticleTranslation.findOne({
      articleId,
      language
    });
    
    return translation?.isTranslationComplete || false;
  }
}


───

🎨 Frontend Implementation

1. Language Switcher Component

tsx
// components/Article/LanguageSwitcher.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { Icon } from '@/components/common/Icon';

export const LanguageSwitcher = ({ articleId }: { articleId: string }) => {
  const { currentLang, setLanguage, availableLanguages, translations } = useTranslation(articleId);
  
  if (!availableLanguages.length) return null;
  
  return (
    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-lg p-2 border border-[var(--border)]">
      <Icon name="globe" size={20} className="text-[var(--text-secondary)]" />
      
      <div className="flex gap-1">
        {availableLanguages.map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all
              `${currentLang === lang 
                ? 'bg-[var(--accent)] text-white' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
              }
              $`{!translations[lang]?.isTranslationComplete && lang !== 'en' 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
              }
            `}
            disabled={!translations[lang]?.isTranslationComplete && lang !== 'en'}
          >
            {lang === 'en' ? '🇬🇧 English' : '🇪🇹 አማርኛ'}
            {!translations[lang]?.isTranslationComplete && lang !== 'en' && (
              <span className="ml-1 text-xs">(Incomplete)</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Translation progress indicator */}
      {currentLang === 'am' && translations.am?.translationProgress < 100 && (
        <div className="ml-2 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <div className="w-20 h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] transition-all"
              style={{ width: ``${translations.am.translationProgress}%` }}
            />
          </div>
          <span>{translations.am.translationProgress}%</span>
        </div>
      )}
    </div>
  );
};


1. Translation Hook

tsx
// hooks/useTranslation.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface TranslationState {
  currentLang: 'en' | 'am';
  availableLanguages: ('en' | 'am')[];
  translations: {
    en: {
      title: string;
      description: string;
      content: string;
      isTranslationComplete: boolean;
      translationProgress: number;
    };
    am: {
      title: string;
      description: string;
      content: string;
      isTranslationComplete: boolean;
      translationProgress: number;
    };
  };
  setLanguage: (lang: 'en' | 'am') => void;
  loading: boolean;
}

export const useTranslation = (articleId: string): TranslationState => {
  const [currentLang, setCurrentLang] = useState<'en' | 'am'>('en');
  const [availableLanguages, setAvailableLanguages] = useState<('en' | 'am')[]>([]);
  const [translations, setTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's language preference from profile
    const userLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(userLang as 'en' | 'am');
    
    fetchTranslations();
  }, [articleId]);

  const fetchTranslations = async () => {
    try {
      const response = await api.get(`/articles/$`{articleId}/translations`);
      const data = response.data;
      
      setAvailableLanguages(data.availableLanguages);
      setTranslations(data.translations);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = async (lang: 'en' | 'am') => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Trigger content reload
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
  };

  return {
    currentLang,
    availableLanguages,
    translations,
    setLanguage,
    loading,
  };
};


1. Article View with Multilingual Support

tsx
// pages/ArticleView.tsx
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/Article/LanguageSwitcher';
import { ArticleContent } from '@/components/Article/ArticleContent';
import { ArticleMeta } from '@/components/Article/ArticleMeta';
import { Disclaimer } from '@/components/Article/Disclaimer';

export const ArticleView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState(null);
  const { currentLang, translations, loading } = useTranslation(article?._id);
  
  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    const response = await api.get(`/articles/`${slug}`);
    setArticle(response.data);
  };

  if (loading) return <Loading />;

  // Get current language content
  const currentContent = translations[currentLang];
  const fallbackContent = translations['en'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <LanguageSwitcher articleId={article._id} />
      </div>

      {/* Article Header with Meta */}
      <ArticleMeta 
        title={currentContent?.title || fallbackContent?.title}
        description={currentContent?.description || fallbackContent?.description}
        authors={article.authors}
        readingTime={article.readingTime[currentLang] || article.readingTime.en}
        publishedAt={article.publishedAt}
        tags={currentContent?.tags || article.tags}
        views={article.views}
        bookmarks={article.bookmarks}
      />

      {/* Article Content */}
      <ArticleContent 
        content={currentContent?.content || fallbackContent?.content}
        images={article.images}
        language={currentLang}
      />

      {/* Disclaimer */}
      <Disclaimer 
        disclaimer={article.disclaimer[currentLang] || article.disclaimer.en}
        authors={article.authors}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
      />

      {/* Translation Notice */}
      {currentLang === 'am' && currentContent?.isTranslationComplete === false && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            ⚠️ This article is currently being translated into Amharic. 
            The English version is shown as a reference.
          </p>
        </div>
      )}
    </div>
  );
};


1. Translation Editor Component (For Contributors)

tsx
// components/Editor/TranslationEditor.tsx
export const TranslationEditor = ({ articleId, targetLanguage }: { articleId: string; targetLanguage: 'am' }) => {
  const [sourceContent, setSourceContent] = useState(null);
  const [targetContent, setTargetContent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    // Load source (English) and existing translation
    loadTranslations();
  }, [articleId]);

  const loadTranslations = async () => {
    const response = await api.get(`/articles/$`{articleId}/translations`);
    setSourceContent(response.data.translations.en);
    setTargetContent(response.data.translations.am || {});
    setProgress(response.data.translations.am?.translationProgress || 0);
  };

  const saveTranslation = async () => {
    setSaveStatus('saving');
    try {
      await api.post(`/articles/`${articleId}/translations`, {
        language: targetLanguage,
        ...targetContent,
        translationProgress: progress,
      });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 min-h-[600px]">
      {/* Source (English) */}
      <div className="border-r border-[var(--border)] pr-8">
        <h3 className="font-bold mb-4">Source (English)</h3>
        <div className="prose prose-sm max-w-none">
          {/* Display source content */}
        </div>
      </div>

      {/* Target (Amharic) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Translation (አማርኛ)</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Progress:</span>
              <div className="w-32 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `$`{progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Button onClick={saveTranslation} disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save Translation'}
            </Button>
          </div>
        </div>

        {/* Translation Editor */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title (አርዕስት)</label>
            <Input
              value={targetContent.title || ''}
              onChange={(e) => setTargetContent({ ...targetContent, title: e.target.value })}
              placeholder="ትርጉም ያስገቡ..."
              className="mt-1 font-amharic"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description (መግለጫ)</label>
            <Textarea
              value={targetContent.description || ''}
              onChange={(e) => setTargetContent({ ...targetContent, description: e.target.value })}
              placeholder="ትርጉም ያስገቡ..."
              className="mt-1 font-amharic"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content (ይዘት)</label>
            <div className="mt-1">
              <TipTapEditor
                content={targetContent.content || ''}
                onChange={(content) => setTargetContent({ ...targetContent, content })}
                language="am"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <label className="text-sm font-medium">Translation Progress</label>
            <div className="flex items-center gap-4 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={targetContent.isTranslationComplete || false}
                onChange={(e) => setTargetContent({ 
                  ...targetContent, 
                  isTranslationComplete: e.target.checked 
                })}
              />
              <span className="text-sm">Mark translation as complete</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


───

🌐 URL & Routing Strategy

1. Language-Specific URLs

typescript
// routes.tsx

// Option 1: Path-based language (Recommended)
const routes = [
  {
    path: '/en/articles/:slug',
    element: <ArticleView language="en" />,
  },
  {
    path: '/am/articles/:slug',
    element: <ArticleView language="am" />,
  },
  {
    path: '/articles/:slug', // Fallback to user preference
    element: <ArticleView />,
  },
];

// Example URLs:
// https://ishraqhub.com/en/articles/trinity-explained
// https://ishraqhub.com/am/articles/ሥላሴ-ተብራርቷል

// Option 2: Query parameter
// https://ishraqhub.com/articles/trinity?lang=am


1. Slug Generation

typescript
// utils/slug.ts
import slugify from 'slugify';

export const generateSlug = (title: string, language: 'en' | 'am') => {
  if (language === 'am') {
    // For Amharic, we keep the original characters
    // but replace spaces with hyphens and remove special chars
    return title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u1200-\u137F\-\d]/g, '')
      .replace(/-+/g, '-');
  }
  
  // For English, use standard slugify
  return slugify(title, { lower: true, strict: true });
};

// Examples:
// English: "Trinity Explained" → "trinity-explained"
// Amharic: "ሥላሴ ተብራርቷል" → "ሥላሴ-ተብራርቷል"


───

🔍 Search & Discovery (Multilingual)

1. Search API with Language Support

typescript
// backend/services/SearchService.ts

interface SearchParams {
  query: string;
  language: 'en' | 'am';
  topicId?: string;
  tags?: string[];
  limit?: number;
  skip?: number;
}

class SearchService {
  async searchArticles(params: SearchParams) {
    const { query, language, topicId, tags, limit = 20, skip = 0 } = params;
    
    // Search in translations
    const searchResults = await ArticleTranslation.aggregate([
      {
        `$match: {
          language: language,
          $`or: [
            { title: { `$regex: query, $`options: 'i' } },
            { description: { `$regex: query, $`options: 'i' } },
            { content: { `$regex: query, $`options: 'i' } },
            { tags: { `$in: [query] } },
            { keywords: { $`in: [query] } },
          ],
        },
      },
      {
        `$lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article',
        },
      },
      { $`unwind: '`$article' },
      {
        $`match: {
          'article.status': 'published',
          ...(topicId && { 'article.topicId': topicId }),
          ...(tags?.length && { 'article.tags': { `$in: tags } }),
        },
      },
      {
        $`project: {
          title: 1,
          description: 1,
          slug: 1,
          articleId: 1,
          'article.coverImage': 1,
          'article.authors': 1,
          'article.publishedAt': 1,
        },
      },
      { `$skip: skip },
      { $`limit: limit },
    ]);
    
    return searchResults;
  }
}


1. Search UI with Language Toggle

tsx
// components/Search/SearchBar.tsx
export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useDebounce(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get('/search', {
        params: { q: query, lang: language },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, 500);

  return (
    <div className="relative">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Icon 
            name="search" 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" 
          />
          <Input
            placeholder={language === 'en' ? 'Search articles...' : 'ጽሁፎችን ፈልግ...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="am">🇪🇹 አማርኛ</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Search'}
        </Button>
      </div>

      {/* Results */}
      <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
        {results.map(result => (
          <ArticleSearchResult key={result._id} article={result} language={language} />
        ))}
      </div>
    </div>
  );
};


───

🎨 Amharic Font & Typography

1. Custom Font Configuration

css
/* styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Ethiopic:wght@400;600;700&display=swap');

/* Amharic font for content */
.font-amharic {
  font-family: 'Noto Sans Ethiopic', 'Segoe UI', system-ui, sans-serif;
  line-height: 1.8;
  font-size: 1.1rem;
}

/* Arabic font for Quranic verses */
.font-arabic {
  font-family: 'Noto Naskh Arabic', 'Amiri', serif;
  font-size: 1.4rem;
  line-height: 2;
}

/* Article content language-specific */
.article-content.en {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.75;
}

.article-content.am {
  font-family: 'Noto Sans Ethiopic', system-ui, sans-serif;
  font-size: 1.1rem;
  line-height: 2;
}

/* Amharic headings */
.article-content.am h1,
.article-content.am h2,
.article-content.am h3 {
  font-family: 'Noto Sans Ethiopic', system-ui, sans-serif;
  font-weight: 700;
}


1. Amharic Font Support Component

tsx
// components/Article/AmharicText.tsx
export const AmharicText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`font-amharic `${className}`} dir="ltr">
      {children}
    </span>
  );
};


───

🌍 Language Detection & Redirection

1. Auto-Detect User Language

tsx
// lib/languageDetection.ts

export const detectUserLanguage = (): 'en' | 'am' => {
  // 1. Check localStorage
  const saved = localStorage.getItem('preferredLanguage');
  if (saved === 'en' || saved === 'am') return saved;
  
  // 2. Check browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  if (browserLang.startsWith('am')) return 'am';
  
  // 3. Check user's profile (if logged in)
  const user = getUserFromStore();
  if (user?.preferences?.language) return user.preferences.language;
  
  // 4. Default to English
  return 'en';
};

// Auto-redirect to language-specific URL
export const redirectToLanguage = () => {
  const lang = detectUserLanguage();
  const currentPath = window.location.pathname;
  
  // If path doesn't have language prefix, redirect
  if (!currentPath.match(/^\/(en|am)\//)) {
    const newPath = `/$`{lang}`${currentPath}`;
    window.location.href = newPath;
  }
};


1. Language-Aware Layout

tsx
// App.tsx
import { detectUserLanguage } from '@/lib/languageDetection';

export const App = () => {
  const [language, setLanguage] = useState<'en' | 'am'>(detectUserLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'am' ? 'ltr' : 'ltr';
  }, [language]);

  return (
    <ThemeProvider>
      <LanguageProvider value={{ language, setLanguage }}>
        <Router>
          <Routes>
            <Route path="/:lang?/*" element={<MainLayout />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};


───

📊 Database Indexing for Multilingual Performance

typescript
// ArticleTranslation model indexes
ArticleTranslationSchema.index({ articleId: 1, language: 1 }, { unique: true });
ArticleTranslationSchema.index({ slug: 1, language: 1 }, { unique: true });
ArticleTranslationSchema.index({ title: 'text', description: 'text', content: 'text' });
ArticleTranslationSchema.index({ language: 1, tags: 1 });
ArticleTranslationSchema.index({ language: 1, 'article.status': 1 });

// Article model indexes
ArticleSchema.index({ topicId: 1, status: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ publishedAt: -1 });


───

🚀 Updated Roadmap with Multilingual Support

Phase 2: Core Content System (Weeks 3-5)
    ├── Topic CRUD (API + Frontend)
    ├── Article System
    │   ├── Article base model
    │   ├── Article Translation model (en + am)
    │   ├── CRUD for multilingual articles
    │   ├── TipTap Editor (with language support)
    │   ├── Language switcher component
    │   ├── Translation editor (for contributors)
    │   └── Article styling (per language)
    ├── Multilingual Features
    │   ├── URL routing with language prefix
    │   ├── Slug generation (English + Amharic)
    │   ├── Language detection & redirection
    │   ├── Translation progress tracking
    │   └── Fallback to English when Amharic incomplete
    ├── SEO & Metadata (per language)
    │   ├── hreflang tags
    │   ├── Per-language meta titles/descriptions
    │   └── Language-specific sitemaps
    └── Resource Upload (Cloudinary)


───

📋 Complete Multilingual Checklist

Frontend

· Language switcher component
· Article view with language toggle
· Translation editor interface
· Language-aware search
· Auto-detection & redirection
· Amharic font integration
· RTL support (if needed)
· Language-aware routing
· Translation progress indicator

Backend

· Article Translation model
· CRUD for translations
· Translation progress tracking
· Search with language filtering
· Language-specific slug generation
· Fallback logic (Amharic → English)
· SEO meta tags per language
· API endpoints for translations

Database

· Article collection (base)
· ArticleTranslation collection
· Indexes for multilingual queries
· Language availability tracking

SEO

· hreflang tags in <head>
· Language-specific sitemaps
· Canonical URLs per language
· Open Graph tags per language

───

🎯 Final Notes

Translation Workflow

1. Author writes article in English (or Amharic)
2. Translator (can be same author or separate) adds Amharic version
3. Progress tracking shows completion percentage
4. Review process for both versions
5. Publication when both versions are ready (or one version can be published while the other is in progress)

Best Practices

· Primary language: English (as it reaches global audience)
· Secondary: Amharic (local audience)
· Fallback: If Amharic translation isn't ready, show English with a notice
· SEO: Both versions get indexed with proper hreflang tags

User Experience

· Users can switch languages at any time
· Language preference is remembered
· Search works in both languages
· Reading experience is optimized for each language

───
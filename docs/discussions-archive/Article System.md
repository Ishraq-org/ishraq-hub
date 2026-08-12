📝 Ishraq Article System — Complete Discussion Document

───

1. 🎯 Article System Philosophy

Core Principle

"Article = Research Paper + Encyclopedia Entry + Interactive Knowledge Node"

What Makes Our Article System Unique

· Academic rigor: Citations, footnotes, references
· Interconnected knowledge: Wikipedia-style linking creates knowledge graph
· Multilingual: English and Amharic versions side by side
· Rich media: Images, videos, tables, interactive elements
· Beautiful presentation: Every element has custom styling
· Clear authorship: Every article has named author(s)
· Legal compliance: Disclaimers and responsibility notices

Why We Need This

· Traditional Telegram content is unstructured and scattered
· No systematic knowledge base exists
· Readers need interconnected learning
· Scholars need professional publishing platform
· Community needs organized access to Islamic knowledge

───

1. 🏗️ Knowledge Architecture

The Knowledge Hierarchy

KNOWLEDGE SPACE
    │
    ├── TOPIC (Category/Folder)
    │       │
    │       ├── Article (Research)
    │       ├── Article (Analysis)
    │       ├── Resource (PDF)
    │       ├── Resource (Video)
    │       ├── Course (Structured Learning)
    │       └── Debate (Claim/Response)
    │
    ├── SUBTOPIC (Sub-folder)
    │       │
    │       └── [Same structure as Topic]
    │
    └── RELATED CONCEPTS
            │
            └── Interlinked across topics


Topic = Folder, Article = File

But expanded: A topic can contain ANY type of knowledge content, not just articles.

The Knowledge Graph

Article A ──────┐
    │            │
    ├── Links ───┼──► Article B
    │            │
    ├── Mentions ───► Article C
    │
    └── References ──► Article D


Every article is a node in a vast knowledge graph. Readers can navigate from concept to concept, building deep understanding.

───

1. 📊 Article Data Model

Complete Article Structure

typescript
interface IArticle {
  // ============================================
  // BASIC INFORMATION
  // ============================================
  
  _id: ObjectId;
  title: {
    en: string;
    am: string;
  };
  slug: {
    en: string;  // "trinity-explained"
    am: string;  // "ሥላሴ-ተብራርቷል"
  };
  description: {
    en: string;  // Meta description for SEO
    am: string;
  };
  
  // ============================================
  // TOPIC ASSOCIATION
  // ============================================
  
  topicId: ObjectId;           // Primary topic
  subtopicIds: ObjectId[];     // Multiple subtopics
  
  // ============================================
  // CONTENT
  // ============================================
  
  content: {
    en: string;  // MDX format
    am: string;  // MDX format
  };
  contentJson: {
    en: any;  // TipTap JSON (backup)
    am: any;
  };
  
  // ============================================
  // MEDIA
  // ============================================
  
  coverImage: string;  // Cloudinary URL (hero image)
  images: {
    url: string;
    caption: {
      en: string;
      am: string;
    };
    alt: {
      en: string;
      am: string;
    };
    position: 'left' | 'center' | 'right' | 'full';
    width: number;
    height: number;
  }[];
  
  // ============================================
  // METADATA
  // ============================================
  
  tags: string[];
  keywords: {
    en: string[];
    am: string[];
  };
  readingTime: {
    en: number;  // minutes
    am: number;
  };
  category: 'aqidah' | 'fiqh' | 'tafsir' | 'hadith' | 'history' | 'apologetics' | 'other';
  
  // ============================================
  // AUTHORSHIP
  // ============================================
  
  authors: {
    userId: ObjectId;
    name: string;
    role: 'primary' | 'co-author' | 'contributor';
    bio: {
      en: string;
      am: string;
    };
    avatar: string;
  }[];
  
  // ============================================
  // RESPONSIBILITY & DISCLAIMER
  // ============================================
  
  disclaimer: {
    en: string;
    am: string;
  };
  responsibilityNote: {
    en: string;
    am: string;
  };
  
  // ============================================
  // STATUS & WORKFLOW
  // ============================================
  
  status: 'draft' | 'review' | 'published' | 'archived' | 'scheduled';
  isFeatured: boolean;
  isPremium: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // ============================================
  // PUBLISHING
  // ============================================
  
  publishedAt: Date;
  scheduledAt: Date;
  lastEditedAt: Date;
  
  // ============================================
  // ANALYTICS
  // ============================================
  
  views: number;
  uniqueViews: number;
  shares: number;
  bookmarks: number;
  downloadCount: number;
  
  // ============================================
  // SEO
  // ============================================
  
  metaTitle: {
    en: string;
    am: string;
  };
  metaDescription: {
    en: string;
    am: string;
  };
  canonicalUrl: {
    en: string;
    am: string;
  };
  noIndex: boolean;
  ogImage: string;
  
  // ============================================
  // SYSTEM
  // ============================================
  
  createdBy: ObjectId;
  createdByRole: 'contributor' | 'author' | 'admin' | 'super_admin';
  reviewedBy: ObjectId;
  approvedBy: ObjectId;
  reviewComments: {
    reviewerId: ObjectId;
    comment: string;
    date: Date;
    isResolved: boolean;
  }[];
  
  // ============================================
  // VERSION HISTORY
  // ============================================
  
  versionHistory: {
    language: 'en' | 'am';
    version: number;
    content: string;
    updatedBy: ObjectId;
    date: Date;
    changes: string;  // Summary of changes
    reason: string;   // Why was this version created
  }[];
  
  // ============================================
  // LANGUAGE AVAILABILITY
  // ============================================
  
  availableLanguages: ('en' | 'am')[];
  translationProgress: {
    en: number;  // 0-100
    am: number;
  };
  isTranslationComplete: {
    en: boolean;
    am: boolean;
  };
  
  // ============================================
  // TIMESTAMPS
  // ============================================
  
  createdAt: Date;
  updatedAt: Date;
}


───

1. 🔗 Article Linking System (Wikipedia-Style)

The Vision

"Every word can lead to a world of knowledge."

When reading an article, important terms are linked to other articles. Hovering over a linked term shows a preview of that article. Clicking navigates to the full article.

Link Model

typescript
interface IArticleLink {
  _id: ObjectId;
  
  // Source and target
  sourceArticleId: ObjectId;
  targetArticleId: ObjectId;
  
  // Link details
  anchorText: {
    en: string;   // The word(s) linked in English version
    am: string;   // The word(s) linked in Amharic version
  };
  startPosition: {
    en: number;   // Character position in English content
    am: number;   // Character position in Amharic content
  };
  endPosition: {
    en: number;
    am: number;
  };
  context: {
    en: string;   // Surrounding sentence (for preview)
    am: string;
  };
  
  // Link type
  relationship: 'explains' | 'refutes' | 'supports' | 'defines' | 'see_also' | 'expands';
  
  // Preview cache (for fast hover)
  preview: {
    title: {
      en: string;
      am: string;
    };
    description: {
      en: string;
      am: string;
    };
    coverImage: string;
    category: string;
    relatedCount: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}


Link Types & Their Meanings

Type Meaning Example
Defines Article defines the concept "The Trinity doctrine states..." → links to article defining Trinity
Explains Article explains the concept in detail "This is related to Christology..." → links to Christology article
Refutes Article refutes the concept "The Islamic view differs..." → links to Islamic view article
Supports Article supports the concept "As scholars have noted..." → links to scholars article
See Also Related concept "Also relevant: Quranic Preservation" → links to Quranic Preservation article
Expands Expands on a sub-topic "...which was addressed in Nicene Council..." → links to Nicene Council article

Link Insertion in Editor

Editor Workflow:
1. Select a word/phrase in the article
2. Click "Link to Article" button
3. Search for the target article
4. Select the article
5. Choose relationship type
6. Link is created
7. In preview, the word appears as a link
8. Hover shows preview of target article


Link Resolution

When rendering article:
1. Parse content for link markers
2. For each link marker:
   a. Fetch target article preview
   b. Wrap the text in <a> tag
   c. Add hover event listener
3. On hover:
   a. Fetch preview content (if not cached)
   b. Display popover with preview
4. On click:
   a. Navigate to target article
   b. Open in new tab (optional)


───

1. 🖋️ Rich Text Editor (TipTap)

Editor Philosophy

"Not a blog editor. A research editor."

Core Editor Features

Formatting

· Bold, Italic, Underline, Strike — Standard emphasis
· Code — Inline code formatting
· Highlight — Text highlighting (for key terms)

Headings

· H1 — Article title (used once)
· H2 — Section headers
· H3 — Subsection headers
· H4 — Sub-subsections

Lists

· Bullet List — Unordered lists
· Ordered List — Numbered lists
· Task List — Checkboxes (future)

Blocks

· Blockquote — For scholarly citations and definitions
· Code Block — For programming code
· Horizontal Rule — Section break

Academic Features

1. Footnotes & References

Insert Footnote:
1. Place cursor where footnote marker should appear
2. Click "Insert Footnote"
3. Enter footnote content
4. System auto-numbers the footnote
5. Footnote appears at bottom of article
6. Clicking footnote number jumps to footnote
7. Clicking footnote jumps back to text

Features:
- Auto-numbering
- Click to jump
- References section auto-generated
- Citation formats (APA, MLA, Chicago)
- Import from reference managers (future)


1. Quran Insertion

Insert Quran Verse:
1. Click "Insert Quran"
2. Search by Surah and Ayah
3. Or browse by Surah
4. Select verse
5. System inserts:
   - Arabic text (right-aligned)
   - Translation
   - Surah/Ayah reference
   - Optional: Transliteration

Display options:
- Arabic only
- Arabic + Translation
- Arabic + Transliteration
- Full (all three)


1. Hadith Insertion

Insert Hadith:
1. Click "Insert Hadith"
2. Search by narrator, text, or reference
3. Select Hadith
4. System inserts:
   - Arabic text
   - Translation
   - Narrator
   - Reference
   - Grade (if available)


1. Citations

Insert Citation:
1. Click "Insert Citation"
2. Enter source details:
   - Author
   - Title
   - Year
   - Publisher
   - Pages
3. Choose citation style (APA, MLA, Chicago)
4. System formats the citation
5. Adds to reference list


Content Components

1. Image Insertion

Insert Image:
1. Click "Insert Image"
2. Upload image (Cloudinary)
3. Add:
   - Caption (English + Amharic)
   - Alt text (English + Amharic)
   - Position (left, center, right, full)
4. System inserts styled image
5. Image is responsive
6. Click image to zoom (lightbox)


1. Video Embed

Insert Video:
1. Click "Insert Video"
2. Paste YouTube URL or Cloudinary URL
3. Add title and description
4. System embeds video player
5. Responsive aspect ratio
6. Full-screen support


1. Table

Insert Table:
1. Click "Insert Table"
2. Define rows and columns
3. Enter data
4. Add caption (optional)
5. System renders styled table
6. Tables are responsive
7. Column sorting (future)


1. Timeline (For Debates)

Insert Timeline:
1. Click "Insert Timeline"
2. Add events with:
   - Timestamp (e.g., 21:20)
   - Title
   - Description
   - Optional: YouTube video link
3. System renders interactive timeline
4. Click timestamp jumps to video
5. Visual timeline with markers


1. Warning/Info Boxes

Insert Box:
1. Click "Insert Box"
2. Choose type:
   - Info (blue)
   - Warning (yellow)
   - Success (green)
   - Danger (red)
3. Add title (optional)
4. Add content
5. System renders styled box
6. Distinctive colors for each type

Use cases:
- Common misconceptions → Warning box
- Key definitions → Info box
- Important quotes → Success box
- Controversial topics → Danger box


1. FAQ Accordion

Insert FAQ:
1. Click "Insert FAQ"
2. Add questions and answers
3. Questions are always visible
4. Answers expand on click
5. Only one answer open at a time
6. Perfect for Q&A sections


1. Article Link (Wikipedia-style)

Insert Article Link:
1. Select text
2. Click "Link to Article"
3. Search for target article
4. Select relationship type
5. Link is created
6. Hover shows preview
7. Click navigates to article


───

1. 🎨 Article Styling System

Design Philosophy

"Every element has its own personality, but they all speak the same language."

Typography

· Body text: Clean, readable, 1.125rem
· Line height: 1.75 (comfortable reading)
· Headings: Clear hierarchy
· Amharic: Special font with proper rendering

Layout

┌─────────────────────────────────────────────────┐
│                HEADER                          │
│    ┌─────────────────────────────────────┐      │
│    │         COVER IMAGE                 │      │
│    │    (Full width, blurred overlay)    │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    TITLE (H1)                                    │
│    ──────────────────────────────────────────     │
│    Author Name | Reading Time | Date              │
│    ──────────────────────────────────────────     │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │      TABLE OF CONTENTS              │      │
│    │      (Auto-generated)              │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ──── BODY ──────────────────────────────     │
│                                                 │
│    [Text with rich formatting]                   │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │    QUOTE BLOCK / PULL QUOTE         │      │
│    │    (Distinctive, with accent)       │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    [Continue content]                           │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │    IMAGE WITH CAPTION               │      │
│    │    (Styled with border/effects)     │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │    WARNING / INFO BOX               │      │
│    │    (Colored, with icon)             │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ──── FOOTER ──────────────────────────────     │
│                                                 │
│    Author Bio                                   │
│    ──────────────────────────────────────────     │
│    Related Articles                             │
│    ──────────────────────────────────────────     │
│    Tags | Share | Bookmark                       │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │    DISCLAIMER BOX                   │      │
│    │    "Views expressed are author's   │      │
│    │    own responsibility..."           │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ──── COMMENTS (Future) ──────────────────     │
└─────────────────────────────────────────────────┘


Component Styling Guidelines

1. Headings

· H1: 2.5rem, bold, margin-top: 2rem
· H2: 1.875rem, semibold, margin-top: 1.5rem
· H3: 1.5rem, semibold, margin-top: 1.25rem
· H4: 1.25rem, semibold, margin-top: 1rem

1. Images

· Rounded corners
· Border (subtle)
· Shadow (on hover)
· Caption: centered, italic, 0.875rem
· Zoomable (lightbox)

1. Tables

· Striped rows
· Hover effect
· Border
· Responsive (horizontal scroll on mobile)

1. Blockquotes

· Left border (accent color)
· Background (subtle)
· Italic text
· Footer with citation

1. Boxes

· Colored background
· Border (left colored)
· Icon
· Title (bold)
· Consistent padding

1. FAQ

· Clean accordion style
· Question: bold, clickable
· Answer: light background
· Smooth animation

1. Footnotes

· Superscript
· Accent color
· Click to jump
· Back link (↩)

───

1. 🌐 Multilingual Article System

How It Works

One Article, Multiple Languages

Article (Base)
    ├── English Version
    │   ├── Title: "Trinity Explained"
    │   ├── Slug: "trinity-explained"
    │   ├── Content: "..."
    │   └── Metadata: [...]
    │
    └── Amharic Version
        ├── Title: "ሥላሴ ተብራርቷል"
        ├── Slug: "ሥላሴ-ተብራርቷል"
        ├── Content: "..."
        └── Metadata: [...]


Translation Workflow

Step 1: Author writes in English (primary)
    ↓
Step 2: Article published in English
    ↓
Step 3: Translator accesses article
    ↓
Step 4: Translator adds Amharic version
    ├── Translates title
    ├── Translates description
    ├── Translates content
    └── Translation progress tracked (0-100%)
    ↓
Step 5: Translation submitted for review
    ↓
Step 6: Reviewer checks Amharic version
    ├── Approves
    ├── Requests revisions
    └── Rejects
    ↓
Step 7: Published (or revised)
    ↓
Step 8: Both languages available


Language Switching

User Experience:
1. User reads article in English
2. Sees "Read in Amharic" button
3. Clicks button
4. Page reloads in Amharic
5. URL updates to Amharic slug
6. Content shows in Amharic
7. All UI elements switch language
8. User can switch back anytime

URL Structure:
- English: /en/articles/trinity-explained
- Amharic: /am/articles/ሥላሴ-ተብራርቷል

Auto-detection:
- Browser language detection
- User preference (logged in)
- Default: English
- Can override manually


Translation Editor

Translator Dashboard:
1. See assigned translation tasks
2. Open article to translate
3. Side-by-side view:
   Left: English version
   Right: Amharic translation
4. Translate section by section
5. Save progress anytime
6. Translation progress bar
7. Submit for review when complete

Features:
- Auto-save
- Translation memory (future)
- Glossary (future)
- Style guide (future)
- Team collaboration (future)


Fallback Strategy

· If Amharic version not available → Show English
· User sees notice: "This article is being translated into Amharic"
· Translation in progress → Show English version
· Partial translation → Show translated sections in Amharic

───

1. 📋 Article Workflow

Complete Article Lifecycle

┌──────────────────────────────────────────────────────────────┐
│                    ARTICLE LIFECYCLE                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Creation                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Contributor/Author starts new article             │     │
│  │  └── Enters topic, title, description              │     │
│  │  └── Writes content in editor                      │     │
│  │  └── Inserts images, videos, tables               │     │
│  │  └── Adds links to other articles                  │     │
│  │  └── Saves as draft                                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Step 2: Review                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Contributor/Author submits for review             │     │
│  │  └── Status: draft → review                       │     │
│  │  └── Reviewer queue updated                        │     │
│  │  └── Notifications sent to reviewers               │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Step 3: Review Process                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Reviewer opens review queue                       │     │
│  │  └── Reads article                                 │     │
│  │  └── Checks: quality, accuracy, citations         │     │
│  │  └── Makes decision:                               │     │
│  │      ├── Approve → Status: approved                │     │
│  │      ├── Request Revision → Status: draft         │     │
│  │      └── Reject → Status: rejected                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Step 4: Publication                                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Article is published                              │     │
│  │  └── Status: published                            │     │
│  │  └── PublishedAt timestamp set                     │     │
│  │  └── Publicly visible                              │     │
│  │  └── Notifications sent to subscribers             │     │
│  │  └── Added to search index                         │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Step 5: Updates                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Author updates published article                  │     │
│  │  └── Status: published → updating                  │     │
│  │  └── New version created                           │     │
│  │  └── Version history updated                       │     │
│  │  └── Status: published (after approval)            │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Step 6: Archiving                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Article is archived                               │     │
│  │  └── Status: published → archived                  │     │
│  │  └── Removed from public view                      │     │
│  │  └── Still accessible via direct link              │     │
│  │  └── Archived reason noted                         │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘


Status Definitions

Status Meaning Who Can See
Draft Article being written Author, Contributors
Review Submitted for review Reviewers, Admins
Approved Ready to publish Admin
Published Live on platform Everyone
Scheduled Scheduled for future Admin
Archived Removed from public Admins
Rejected Not accepted Author, Admins

Version History

Every article update creates a new version:
- Version 1: Original content (Draft)
- Version 2: First revision (Review)
- Version 3: Published version
- Version 4: Updated version (Published)
- Version 5: Major revision (Draft)
- Version 6: Re-published

Users can view version history
Admins can revert to previous versions
Authors can compare versions


───

1. 👥 Article Responsibility System

Disclaimer Framework

Why We Need This

· Multiple contributors from different backgrounds
· Content may be controversial
· Legal protection for platform
· Clear attribution of responsibility

Disclaimer Content

Content Responsibility

The views, opinions, and conclusions expressed in this article are those 
of the author(s) and do not necessarily reflect the official position 
of Ishraq Platform. The author(s) bear full responsibility for the 
accuracy, validity, and integrity of the content presented.

Author: [Name(s)]
Published: [Date]
Last Updated: [Date]


Responsibility Levels

Level Responsibility Who
Content Accuracy, validity, integrity Author
Editorial Quality, formatting, citations Reviewer/Editor
Platform Curation, hosting, distribution Ishraq

Legal Framework

· Contributor Agreement: Legal contract with contributors
· Disclaimer: Clear on every article
· Terms of Service: Platform terms and conditions
· Privacy Policy: Data handling
· DMCA: Copyright takedown policy

───

1. 🔍 Article Search & Discovery

Search Capabilities

Unified Search

· Single search box
· Searches: Articles, Topics, Resources, Courses, Debates
· Results grouped by type
· Relevant snippets

Search Filters

· By Topic: Filter by category
· By Author: Filter by author
· By Date: Newest, oldest
· By Type: Articles, Resources, Courses
· By Language: English, Amharic

Search Algorithm

· Title: High weight
· Description: Medium weight
· Content: Low weight
· Tags: High weight
· Keywords: High weight
· Recent articles: Bonus

Discovery Features

Related Content

· At bottom of each article
· Related articles
· Related resources
· Related courses
· Related debates

Recommendations

· Based on reading history
· Based on bookmarks
· Based on topics of interest
· Personalized for logged-in users

Trending

· Most viewed
· Most bookmarked
· Most shared
· Recently published

───

1. 🔗 Article Integration Points

Integration with Other Systems

1. With User System

· Authors: User profiles displayed
· Contributors: Track user contributions
· Bookmarks: Users bookmark articles
· Progress: Reading history tracked

1. With Resource System

· Articles can reference resources
· Resources can be embedded in articles
· Download links in articles

1. With Course System (Future)

· Articles as course resources
· Course links in articles
· Reading assignments

1. With Debate System

· Articles reference debates
· Debates reference articles
· Cross-linking between content

1. With Telegram Bot

· Search articles
· Get article summaries
· Receive notifications
· Bookmark articles

1. With Notification System

· New article notifications
· Article update notifications
· Review notifications
· Comment notifications

───

1. 🛡️ Article Security

Content Security

· XSS Prevention: Sanitize all content
· Script Injection: Strip scripts
· HTML Injection: Allow only safe tags
· Link Safety: Check external links

Access Control

· Draft: Only author and admin
· Review: Reviewer and above
· Published: Everyone
· Archived: Admin only
· Admin: Full access

Content Moderation

· Review Process: All articles reviewed
· Report System: Users can report
· Moderation Dashboard: For admins
· Appeal Process: Authors can appeal

───

1. 🎨 Sample Article Walkthrough

How "San'aa Manuscripts" Article Would Be Built

1. Article Structure

Hero Image: Parchment folio under UV light (Full width)
    ↓
H1: The San'aa Manuscripts
    ↓
H2: Introduction
    Paragraph explaining the discovery
    ↓
H2: Definition
    Paragraph with blockquote for technical definition
    ↓
H2: Historical Background
    H3: Discovery
        Paragraph with image (Map of Yemen)
    H3: Conservation Project
        Paragraph with image (Great Mosque photo)
    ↓
H2: Key Characteristics
    Table: Feature | Detail
    ↓
H2: Importance
    Bullet list of significance points
    ↓
H2: Common Misconceptions
    Warning box with misconceptions
    ↓
H2: Related Concepts
    Tag links to other articles
    ↓
H2: FAQ
    Accordion with Q&A
    ↓
H2: Conclusion
    Summary paragraph
    ↓
References
    Auto-generated footnote list


1. Content Elements Used

· Hero image (cover image)
· Headings (H1, H2, H3)
· Paragraph text
· Blockquote (for definition)
· Inline images (Map, Great Mosque)
· Table (Key characteristics)
· Bullet list (Importance, Misconceptions)
· Warning box (Misconceptions)
· Related concepts (Tags)
· FAQ accordion (Q&A)
· Footnotes (References)
· Author attribution

1. Styling Applied

· Hero image: Full width, dark overlay
· Headings: Clear hierarchy
· Blockquote: Left accent border
· Table: Striped, bordered
· Warning box: Yellow background, left border
· FAQ: Clean accordion
· Footnotes: Superscript numbers

───

1. 🚀 Article System Roadmap

Phase 1: Core Article System (v1)

· ✅ Article CRUD
· ✅ Basic editor (TipTap)
· ✅ Markdown/MDX support
· ✅ Image upload
· ✅ Basic styling
· ✅ Status workflow
· ✅ Author attribution
· ✅ Disclaimer system

Phase 2: Advanced Features (v1.1)

· ✅ Wikipedia-style linking
· ✅ Footnote system
· ✅ Citation management
· ✅ Tables
· ✅ Video embed
· ✅ SEO metadata
· ✅ Advanced styling

Phase 3: Multilingual Support (v1.2)

· ✅ English + Amharic
· ✅ Language switcher
· ✅ Translation editor
· ✅ Translation progress tracking
· ✅ Language-specific slugs

Phase 4: Interactive Features (v2)

· ✅ FAQ accordion
· ✅ Timeline
· ✅ Warning/Info boxes
· ✅ Quran/Hadith insertion
· ✅ Advanced search

Phase 5: Community Features (v3)

· ✅ Comments
· ✅ Discussion boards
· ✅ User ratings
· ✅ Content recommendations

───

1. 💬 Discussion Points

Content Quality

· What are our quality standards?
· How do we ensure accuracy?
· Who verifies scholarly content?
· What about controversial topics?

Contributors

· How do we attract scholars?
· What incentives for contributors?
· How do we handle competing views?
· What about anonymous contributors?

Curation

· What content is prioritized?
· How do we handle multiple languages?
· What about outdated content?
· How do we handle errors?

Moderation

· Who decides what's published?
· What about sensitive topics?
· How do we handle complaints?
· What about legal issues?

Technical

· How often should we backup?
· What about content versioning?
· How do we handle large articles?
· What about performance?

───

1. 🎯 Summary

The Ishraq Article System is:

Feature Description Status
Rich Editor Full academic editor ✅
Multilingual English + Amharic ✅
Linking Wikipedia-style ✅
Media Images, videos, tables ✅
Academic Footnotes, citations ✅
Workflow Draft → Review → Publish ✅
Responsibility Clear attribution ✅
Integration Connected to all systems ✅
Discovery Search, recommendations ✅
Security Full content security ✅

Key Benefits:

· ✅ Structured knowledge base
· ✅ Interconnected learning
· ✅ Professional publishing
· ✅ Academic rigor
· ✅ Beautiful presentation
· ✅ Legal compliance

───

1. 🔮 Future Considerations

Potential Enhancements

AI Assistance

· Auto-suggest links
· Grammar checking
· Content summarization
· Translation assistance

Collaborative Writing

· Multiple authors
· Version control
· Comments and suggestions
· Track changes

Advanced Analytics

· Reading patterns
· Content effectiveness
· User engagement
· SEO performance

Content Monetization

· Premium articles
· Subscription model
· Pay-per-article
· Membership tiers

───

🕌 Final Word

The Article System is the heart of Ishraq. It's where knowledge is created, organized, and shared. Every feature is designed to serve the Ummah with:

· Quality: Academic rigor and accuracy
· Accessibility: Beautiful, readable content
· Interconnection: Knowledge is connected
· Responsibility: Clear authorship and accountability
· Growth: Scalable and adaptable

"The ink of the scholar is more sacred than the blood of the martyr." — Islam places immense value on knowledge. We honor that by building the best possible platform for Islamic knowledge.

───

This document represents our complete vision for the Ishraq Article System. All decisions are made with the goal of serving the Ummah with high-quality, accessible, and interconnected Islamic knowledge.
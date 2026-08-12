I've analyzed the "San'aa Manuscripts" article you shared. This is an excellent example of the type of academic, research-driven content Ishraq will host. Let me break down what features we need to support this level of scholarly writing.

───

🔍 Feature Extraction from Sample Article

1. Article Structure Elements

Element Example from Article Required System Feature
Hero Image [IMAGE 1: weathered parchment folio under ultraviolet light] Featured/cover image at top with caption
Section Headers ## Introduction, ## Historical Background Heading levels (H1-H3)
Subsections ### Discovery, ### Conservation Project Nested headings
Blockquotes Paragraphs with visual distinction Quote block component
Tables Key Characteristics table Table component with styling
Reference Markers [1], [2], etc. Footnote/endnote system
Inline Images [IMAGE 2: Map of Yemen] Images with captions, left/center/right alignment
Callout Boxes Common Misconceptions section Warning/Info box components
Related Concepts List at bottom with links Article linking system with previews
FAQ Section Question/Answer pairs Collapsible accordion/FAQ component
Conclusion Brief summary paragraph Standard paragraph styling
References Numbered list with sources Citation management system

1. Content Types Used

📄 Article Components Found:
├── 📸 Hero Image (full width with caption)
├── 📝 Introduction paragraph
├── 📑 Section headings (H2, H3)
├── 📊 Feature comparison table
├── 🖼️ Inline images (with captions)
├── 💬 Blockquotes (for scholarly definitions)
├── ⚠️ Misconception boxes (with bullet points)
├── 🔗 Internal links to concepts
├── ❓ FAQ section (collapsible)
├── 📚 Reference list (footnotes)
└── 🏷️ Related concepts (tag-like display)


1. Special Formatting Needs

Feature Purpose Editor Requirement
Bold/Italic Emphasis, terminology Standard formatting
Blockquotes Citing scholars, definitions Quote extension
Bullet Lists Common Misconceptions List extension
Numbered Lists Steps, sequences Ordered list extension
Tables Comparative data Table extension
Footnotes Citations [1] Footnote extension
Internal Links Related Concepts Article link extension
Image Captions Descriptive text Image with caption extension
Callout Boxes Misconceptions, warnings Box extension
FAQ Accordion Question/Answer pairs Custom extension

───

🎯 Required Features for Article Writing System

Based on the sample article, here's what we need:

1. Core Editor Features

tsx
const REQUIRED_FEATURES = {
  formatting: {
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    highlight: true,
  },
  headings: {
    h1: true, // Article title
    h2: true, // Section headers
    h3: true, // Subsection headers
    h4: true, // Sub-subsections
  },
  lists: {
    bullet: true,
    ordered: true,
    task: false, // Not needed yet
  },
  blocks: {
    paragraph: true,
    blockquote: true,
    codeBlock: true,
    horizontalRule: true,
  },
  alignment: {
    left: true,
    center: true,
    right: true,
    justify: true,
  },
  indentation: {
    increase: true,
    decrease: true,
  },
};


1. Academic Features

tsx
const ACADEMIC_FEATURES = {
  footnotes: {
    insert: true,
    autoNumber: true,
    preview: true,
    jumpToReference: true,
  },
  citations: {
    insert: true,
    format: ['apa', 'mla', 'chicago'],
    autoComplete: true,
  },
  references: {
    autoGenerate: true,
    linkToFootnotes: true,
    sort: true,
  },
  relatedConcepts: {
    insert: true,
    linkToArticle: true,
    previewOnHover: true,
  },
  quran: {
    insert: true,
    displayArabic: true,
    displayTranslation: true,
    displayTransliteration: true,
  },
  hadith: {
    insert: true,
    displayArabic: true,
    displayTranslation: true,
    withGrade: true,
  },
};


1. Media Features

tsx
const MEDIA_FEATURES = {
  images: {
    upload: true,
    caption: true,
    altText: true,
    alignment: ['left', 'center', 'right', 'full'],
    zoom: true,
    gallery: true,
    lazyLoad: true,
  },
  videos: {
    embed: true,
    youtube: true,
    cloudinary: true,
    caption: true,
    thumbnail: true,
  },
  audio: {
    embed: true,
    player: true,
    transcript: true,
  },
  documents: {
    embed: true,
    download: true,
    preview: true,
  },
};


1. Interactive Features

tsx
const INTERACTIVE_FEATURES = {
  faq: {
    insert: true,
    expandCollapse: true,
    searchable: true,
  },
  table: {
    insert: true,
    sortable: true,
    responsive: true,
    caption: true,
  },
  timeline: {
    insert: true,
    clickToJump: true,
    videoIntegration: true,
  },
  warningBoxes: {
    info: true,
    warning: true,
    success: true,
    danger: true,
    custom: true,
  },
  accordion: {
    insert: true,
    multiple: true,
    nested: true,
  },
};


1. SEO & Metadata Features

tsx
const SEO_FEATURES = {
  metadata: {
    title: true,
    description: true,
    keywords: true,
    canonicalUrl: true,
    noIndex: true,
  },
  social: {
    ogTitle: true,
    ogDescription: true,
    ogImage: true,
    twitterCard: true,
  },
  structuredData: {
    article: true,
    faq: true,
    howTo: false,
  },
  language: {
    en: true,
    am: true,
    hreflang: true,
  },
};


───

🛠️ Technical Implementation

1. TipTap Extension Configuration

tsx
// lib/editor/extensions/index.ts
import { 
  StarterKit, 
  Bold, 
  Italic, 
  Underline, 
  Strike, 
  Code,
  Heading, 
  Blockquote, 
  BulletList, 
  OrderedList, 
  ListItem,
  CodeBlock,
  HorizontalRule,
  HardBreak,
  Gapcursor,
  History,
} from '@tiptap/starter-kit';

import { 
  Image, 
  ImageCaption, 
  Table, 
  TableRow, 
  TableCell, 
  TableHeader,
  Footnote,
  Citation,
  Quran,
  Hadith,
  Timeline,
  Accordion,
  WarningBox,
  ArticleLink,
  VideoEmbed,
  FaqAccordion,
} from './custom';

// Configuration
export const editorExtensions = [
  // Core formatting
  StarterKit,
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Heading,
  Blockquote,
  BulletList,
  OrderedList,
  ListItem,
  CodeBlock,
  HorizontalRule,
  HardBreak,
  Gapcursor,
  History,
  
  // Custom extensions
  Image,
  ImageCaption,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Footnote,
  Citation,
  Quran,
  Hadith,
  Timeline,
  Accordion,
  WarningBox,
  ArticleLink,
  VideoEmbed,
  FaqAccordion,
];


1. Custom Extension for FAQ (Accordion)

tsx
// lib/editor/extensions/FaqAccordion.tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const FaqAccordion = Node.create({
  name: 'faqAccordion',
  
  group: 'block',
  content: 'faqItem+',
  isolating: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Frequently Asked Questions',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-faq-accordion]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-faq-accordion': '' })];
  },
  
  addCommands() {
    return {
      insertFaqAccordion: () => ({ commands }) => {
        return commands.insertContent({
          type: 'faqAccordion',
          content: [
            {
              type: 'faqItem',
              attrs: { question: 'Question 1' },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Answer here...' }] }],
            },
            {
              type: 'faqItem',
              attrs: { question: 'Question 2' },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Answer here...' }] }],
            },
          ],
        });
      },
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(FaqAccordionComponent);
  },
});

// React Component
const FaqAccordionComponent = ({ node }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  return (
    <div className="my-8 border border-[var(--border)] rounded-lg overflow-hidden">
      {node.content.content.map((item, index) => (
        <div key={index} className="border-b last:border-b-0 border-[var(--border)]">
          <button
            className="w-full px-6 py-4 text-left font-medium flex justify-between items-center hover:bg-[var(--bg-secondary)] transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span>{item.attrs.question}</span>
            <Icon 
              name={openIndex === index ? 'chevron-up' : 'chevron-down'} 
              size={20} 
            />
          </button>
          <div className={`
            px-6 py-4 bg-[var(--bg-secondary)] 
            $`{openIndex === index ? 'block' : 'hidden'}
          `}>
            <NodeRenderer content={item.content} />
          </div>
        </div>
      ))}
    </div>
  );
};


1. Footnote Extension

tsx
// lib/editor/extensions/Footnote.tsx
export const Footnote = Node.create({
  name: 'footnote',
  
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      id: {
        default: null,
      },
      content: {
        default: '',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(HTMLAttributes, { 'data-footnote': '' })];
  },
  
  addCommands() {
    return {
      insertFootnote: (content: string) => ({ commands }) => {
        const id = Date.now().toString();
        return commands.insertContent({
          type: 'footnote',
          attrs: { id, content },
        });
      },
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(FootnoteComponent);
  },
});

const FootnoteComponent = ({ node, getPos, editor }) => {
  const { id, content } = node.attrs;
  
  return (
    <sup className="inline-block">
      <a 
        href={`#footnote-`${id}`} 
        id={`ref-$`{id}`}
        className="text-[var(--accent)] hover:underline text-xs font-bold cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          // Jump to footnote at bottom
          const footnoteEl = document.getElementById(`footnote-`${id}`);
          if (footnoteEl) {
            footnoteEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        [{id}]
      </a>
    </sup>
  );
};


1. Footnote List Component (Automatic Generation)

tsx
// components/Article/FootnoteList.tsx
export const FootnoteList = ({ content }: { content: string }) => {
  // Parse content for footnote markers
  const footnotes = extractFootnotes(content);
  
  if (!footnotes.length) return null;
  
  return (
    <div className="mt-12 pt-6 border-t border-[var(--border)]">
      <h4 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Footnotes</h4>
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        {footnotes.map((fn, index) => (
          <p key={fn.id} id={`footnote-$`{fn.id}`} className="pl-8 relative">
            <sup className="absolute left-0 text-[var(--accent)]">{fn.id}</sup>
            {fn.content}
            <a 
              href={`#ref-`${fn.id}`} 
              className="ml-2 text-[var(--accent)] hover:underline text-xs"
            >
              ↩
            </a>
          </p>
        ))}
      </div>
    </div>
  );
};


───

📋 Article Writing System — Complete Feature Checklist

Phase 1: Core Editor (Week 3)

· Basic formatting (bold, italic, underline, strike)
· Headings (H1-H4)
· Lists (bullet, ordered)
· Blockquotes
· Code blocks
· Horizontal rule
· Text alignment
· Undo/Redo

Phase 2: Academic Features (Week 4)

· Footnote system
· Citation management
· References section
· Quran verse insertion
· Hadith insertion
· Book citation

Phase 3: Media & Layout (Week 4-5)

· Image upload with caption
· Image alignment (left, center, right, full)
· Image gallery
· Video embed (YouTube, Cloudinary)
· Audio embed
· Table with sort

Phase 4: Interactive Components (Week 5)

· FAQ accordion
· Warning/Info boxes
· Timeline (with timestamp linking)
· Related concepts linking
· Article link (Wikipedia-style)

Phase 5: SEO & Metadata (Week 5-6)

· Meta title/description
· Tags management
· Slug generation
· Canonical URL
· Open Graph tags
· hreflang for multilingual

Phase 6: Multilingual Support (Week 6)

· Language switcher
· Translation editor
· Translation progress
· Fallback content

───

🎨 Styling Specifications for Article Elements

Based on Sample Article Analysis

scss
// Article styling for academic/research content

.article-content {
  // Typography
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--text-primary);
  
  // Headings
  h1 { font-size: 2.5rem; font-weight: 700; margin: 2rem 0 1rem; }
  h2 { font-size: 1.875rem; font-weight: 600; margin: 1.5rem 0 1rem; }
  h3 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 0.75rem; }
  h4 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
  
  // Hero image (full width)
  .hero-image {
    width: 100%;
    max-height: 600px;
    object-fit: cover;
    border-radius: 12px;
    margin: 0 0 2rem 0;
    
    figcaption {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }
  }
  
  // Inline images
  .inline-image {
    margin: 1.5rem 0;
    
    &.left {
      float: left;
      margin-right: 1.5rem;
      max-width: 50%;
    }
    
    &.right {
      float: right;
      margin-left: 1.5rem;
      max-width: 50%;
    }
    
    &.center {
      display: block;
      margin-left: auto;
      margin-right: auto;
      max-width: 80%;
    }
    
    &.full {
      width: 100%;
    }
    
    img {
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    
    figcaption {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-align: center;
      margin-top: 0.5rem;
      font-style: italic;
    }
  }
  
  // Tables (like Key Characteristics)
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.95rem;
    
    thead {
      background: var(--bg-secondary);
      
      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid var(--border);
      }
    }
    
    tbody {
      tr {
        border-bottom: 1px solid var(--border);
        
        &:hover {
          background: var(--bg-secondary);
        }
      }
      
      td {
        padding: 0.75rem 1rem;
        vertical-align: top;
      }
    }
    
    // Alternating row colors
    tbody tr:nth-child(even) {
      background: var(--bg-secondary);
    }
  }
  
  // Blockquotes (for definitions, scholarly quotes)
  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--accent);
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
    
    p {
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--text-primary);
    }
    
    footer {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  }
  
  // Common Misconceptions (Warning boxes)
  .misconception-box {
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: #fef3c7; // Warm yellow
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    
    [data-theme="dark"] & {
      background: #3d2a1a;
      border-left-color: #d97706;
    }
    
    > p {
      margin: 0;
      font-size: 0.95rem;
      
      > strong:first-child {
        display: block;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }
    }
    
    ul {
      margin: 0.5rem 0 0 1.5rem;
      list-style-type: disc;
      
      li {
        margin: 0.25rem 0;
        font-size: 0.95rem;
      }
    }
  }
  
  // Related Concepts (tag-like display)
  .related-concepts {
    margin: 2rem 0;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border);
    
    h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    
    .concept-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      
      a {
        padding: 0.25rem 0.75rem;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 20px;
        font-size: 0.875rem;
        color: var(--text-primary);
        transition: all 0.2s;
        
        &:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      }
    }
  }
  
  // FAQ Accordion
  .faq-accordion {
    margin: 2rem 0;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    
    .faq-item {
      border-bottom: 1px solid var(--border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .faq-question {
        width: 100%;
        padding: 1rem 1.5rem;
        background: var(--bg-secondary);
        border: none;
        text-align: left;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s;
        
        &:hover {
          background: var(--bg-primary);
        }
      }
      
      .faq-answer {
        padding: 1rem 1.5rem;
        background: var(--bg-primary);
        border-top: 1px solid var(--border);
      }
    


───

🎯 Summary — Features Needed Based on Sample

Immediate Must-Have Features

1. ✅ Hero image with caption (full width)
2. ✅ Heading levels (H1-H4)
3. ✅ Blockquotes with citations
4. ✅ Tables with headers and rows
5. ✅ Inline images with caption and alignment
6. ✅ Warning boxes (for misconceptions)
7. ✅ Bullet lists (nested)
8. ✅ Internal links (Related Concepts)
9. ✅ FAQ accordion (collapsible)
10. ✅ Footnotes with references
11. ✅ Reference list (auto-generated from footnotes)
12. ✅ Conclusion paragraph (standard styling)

Nice-to-Have Features

· 🔲 Quran verse insertion
· 🔲 Hadith insertion
· 🔲 Timeline with video linking
· 🔲 Citation management
· 🔲 Audio embedding
· 🔲 PDF embedding

───

📝 Updated Editor Toolbar

Based on the sample article, here's the final toolbar layout:

tsx
// components/Editor/Toolbar.tsx
export const Toolbar = ({ editor }) => {
  return (
    <div className="border-b border-[var(--border)] p-3 bg-[var(--bg-secondary)]">
      <div className="flex flex-wrap gap-1">
        {/* Basic Formatting */}
        <ButtonGroup>
          <ToolbarButton icon="bold" command="toggleBold" />
          <ToolbarButton icon="italic" command="toggleItalic" />
          <ToolbarButton icon="underline" command="toggleUnderline" />
          <ToolbarButton icon="strike" command="toggleStrike" />
          <ToolbarButton icon="code" command="toggleCode" />
        </ButtonGroup>

        <Divider />

        {/* Headings */}
        <ButtonGroup>
          <ToolbarButton icon="heading1" command="toggleHeading1" />
          <ToolbarButton icon="heading2" command="toggleHeading2" />
          <ToolbarButton icon="heading3" command="toggleHeading3" />
          <ToolbarButton icon="heading4" command="toggleHeading4" />
        </ButtonGroup>

        <Divider />

        {/* Lists */}
        <ButtonGroup>
          <ToolbarButton icon="list" command="toggleBulletList" />
          <ToolbarButton icon="listOrdered" command="toggleOrderedList" />
        </ButtonGroup>

        <Divider />

        {/* Blocks */}
        <ButtonGroup>
          <ToolbarButton icon="quote" command="toggleBlockquote" />
          <ToolbarButton icon="codeBlock" command="toggleCodeBlock" />
          <ToolbarButton icon="table" command="insertTable" />
          <ToolbarButton icon="horizontalRule" command="insertHorizontalRule" />
        </ButtonGroup>

        <Divider />

        {/* Alignment */}
        <ButtonGroup>
          <ToolbarButton icon="alignLeft" command="setTextAlignLeft" />
          <ToolbarButton icon="alignCenter" command="setTextAlignCenter" />
          <ToolbarButton icon="alignRight" command="setTextAlignRight" />
          <ToolbarButton icon="alignJustify" command="setTextAlignJustify" />
        </ButtonGroup>

        <Divider />

        {/* Academic Features */}
        <ButtonGroup>
          <ToolbarButton icon="footnote" command="insertFootnote" label="Footnote" />
          <ToolbarButton icon="citation" command="insertCitation" label="Citation" />
          <ToolbarButton icon="quran" command="insertQuran" label="Quran" />
          <ToolbarButton icon="hadith" command="insertHadith" label="Hadith" />
        </ButtonGroup>

        <Divider />

        {/* Content Blocks */}
        <ButtonGroup>
          <Dropdown>
            <Button variant="outline" size="sm">
              <Icon name="plus" size={16} /> Insert
            </Button>
            <DropdownMenu>
              <DropdownItem command="insertImage">📸 Image</DropdownItem>
              <DropdownItem command="insertVideo">🎥 Video</DropdownItem>
              <DropdownItem command="insertFaq">❓ FAQ Accordion</DropdownItem>
              <DropdownItem command="insertTimeline">⏱️ Timeline</DropdownItem>
              <DropdownItem command="insertWarningBox">⚠️ Warning Box</DropdownItem>
              <DropdownItem command="insertInfoBox">ℹ️ Info Box</DropdownItem>
              <DropdownItem command="insertArticleLink">🔗 Article Link</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </ButtonGroup>

        <Divider />

        {/* Undo/Redo */}
        <ButtonGroup>
          <ToolbarButton icon="undo" command="undo" />
          <ToolbarButton icon="redo" command="redo" />
        </ButtonGroup>
      </div>
    </div>
  );
};


───

🚀 Final Implementation Plan

Week 3: Core Editor Setup

· Install TipTap and dependencies
· Configure basic extensions
· Build toolbar components
· Style editor UI

Week 4: Academic Features

· Footnote system
· Citation management
· Quran/Hadith insertion
· Reference generation

Week 5: Content Blocks

· Image with caption
· Video embedding
· Tables
· FAQ accordion
· Warning boxes

Week 6: Advanced Features

· Timeline (with video linking)
· Article linking (Wikipedia-style)
· SEO metadata
· Multilingual support

Week 7: Polish & Testing

· Editor performance optimization
· Mobile responsiveness
· Accessibility
· User testing with sample article

───

This completes the article system analysis!

The sample article has given us a clear picture of what's needed. We now have:

✅ Complete feature list (from the sample article)
✅ Styling specifications (based on academic/research content)
✅ Toolbar configuration (all required buttons)
✅ Custom extensions (for each unique component)
✅ Implementation timeline (phased approach)

Ready to start building the editor! 🚀
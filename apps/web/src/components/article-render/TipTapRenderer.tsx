import React from 'react';
import { QuranVerseDisplay } from './displays/QuranVerseDisplay';
import { HadithDisplay } from './displays/HadithDisplay';
import { BibleVerseDisplay } from './displays/BibleVerseDisplay';
import { EvidenceImageDisplay } from './displays/EvidenceImageDisplay';
import { CalloutDisplay } from './displays/CalloutDisplay';
import { ArticleLinkHover } from '../editor/ArticleLinkHover';
import { HoverPopover } from '../common/HoverPopover';
import { FootnoteReferenceList } from '../editor/FootnoteReferenceList';
import { TOCHeadingItem } from './TableOfContents';

function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\u1200-\u137F\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return slug || `heading-${Math.random().toString(36).substring(2, 7)}`;
}

export function extractHeadingsFromContent(content: any): TOCHeadingItem[] {
  const headings: TOCHeadingItem[] = [];
  const seenIds = new Map<string, number>();

  const traverse = (node: any) => {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      const text = (node.content || []).map((c: any) => c.text || '').join('');

      if (text.trim()) {
        const rawId = slugifyHeading(text);
        const count = (seenIds.get(rawId) || 0) + 1;
        seenIds.set(rawId, count);

        // Handle duplicate heading text collisions (Prompt 11 §114-116)
        const id = count > 1 ? `${rawId}-${count}` : rawId;
        headings.push({ id, level, text });
      }
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);
  return headings;
}

interface TipTapRendererProps {
  content: Record<string, any> | null | undefined;
  language?: string;
}

export const TipTapRenderer: React.FC<TipTapRendererProps> = ({ content, language = 'en' }) => {
  if (!content || !content.content) {
    return <p className="text-[var(--text-muted)] italic">No content available.</p>;
  }

  const headingCounts = new Map<string, number>();
  let footnoteCounter = 0;

  const renderTextMarks = (textNode: any) => {
    let element: React.ReactNode = textNode.text || '';

    if (!textNode.marks || textNode.marks.length === 0) {
      return element;
    }

    for (const mark of textNode.marks) {
      if (mark.type === 'bold') {
        element = <strong>{element}</strong>;
      } else if (mark.type === 'italic') {
        element = <em>{element}</em>;
      } else if (mark.type === 'link') {
        const href = mark.attrs?.href || '#';
        const targetArticleId = mark.attrs?.targetArticleId;

        if (targetArticleId) {
          element = (
            <ArticleLinkHover
              targetArticleId={targetArticleId}
              href={href}
              language={language}
            >
              {element}
            </ArticleLinkHover>
          );
        } else {
          element = (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] underline hover:opacity-80 transition-opacity"
            >
              {element}
            </a>
          );
        }
      }
    }

    return element;
  };

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level || 1;
        const text = (node.content || []).map((c: any) => c.text || '').join('');
        const rawId = slugifyHeading(text);
        const count = (headingCounts.get(rawId) || 0) + 1;
        headingCounts.set(rawId, count);
        const id = count > 1 ? `${rawId}-${count}` : rawId;

        const renderedChildren = (node.content || []).map((child: any, i: number) => (
          <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
        ));

        switch (level) {
          case 1:
            return (
              <h1 id={id} key={index} className="text-2xl sm:text-3xl font-bold mt-8 mb-4 text-[var(--text-primary)]">
                {renderedChildren}
              </h1>
            );
          case 2:
            return (
              <h2 id={id} key={index} className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-[var(--accent)] border-b border-[var(--border)] pb-1">
                {renderedChildren}
              </h2>
            );
          case 3:
            return (
              <h3 id={id} key={index} className="text-lg font-bold mt-5 mb-2 text-[var(--text-primary)]">
                {renderedChildren}
              </h3>
            );
          default:
            return (
              <h4 id={id} key={index} className="text-base font-semibold mt-4 mb-2 text-[var(--text-muted)]">
                {renderedChildren}
              </h4>
            );
        }
      }

      case 'paragraph': {
        return (
          <p key={index} className="my-3 leading-relaxed text-[var(--text-primary)]">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </p>
        );
      }

      case 'text':
        return renderTextMarks(node);

      case 'bulletList':
        return (
          <ul key={index} className="list-disc list-inside my-4 space-y-1 text-[var(--text-primary)] pl-2">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal list-inside my-4 space-y-1 text-[var(--text-primary)] pl-2">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </ol>
        );

      case 'listItem':
        return (
          <li key={index} className="leading-relaxed">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </li>
        );

      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="my-4 pl-4 border-l-4 border-[var(--accent)] italic text-[var(--text-muted)] bg-[var(--bg-secondary)] py-2 pr-2 rounded-r"
          >
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </blockquote>
        );

      case 'table':
        return (
          <div key={index} className="my-6 overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                {(node.content || []).map((child: any, i: number) => (
                  <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'tableRow':
        return (
          <tr key={index} className="border-b border-[var(--border)] last:border-b-0">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </tr>
        );

      case 'tableHeader':
        return (
          <th key={index} className="p-2.5 font-bold bg-[var(--bg-secondary)] text-[var(--accent)] border-r border-[var(--border)] last:border-r-0">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </th>
        );

      case 'tableCell':
        return (
          <td key={index} className="p-2.5 text-[var(--text-primary)] border-r border-[var(--border)] last:border-r-0">
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </td>
        );

      // Custom Content Nodes
      case 'quranVerse':
        return (
          <QuranVerseDisplay
            key={index}
            surah={node.attrs?.surah}
            ayah={node.attrs?.ayah}
            arabicText={node.attrs?.arabicText}
            translation={node.attrs?.translation}
            translationSource={node.attrs?.translationSource}
          />
        );

      case 'hadith':
        return (
          <HadithDisplay
            key={index}
            text={node.attrs?.text}
            narrator={node.attrs?.narrator}
            source={node.attrs?.source}
            grade={node.attrs?.grade}
          />
        );

      case 'bibleVerse':
        return (
          <BibleVerseDisplay
            key={index}
            book={node.attrs?.book}
            chapter={node.attrs?.chapter}
            verse={node.attrs?.verse}
            translationVersion={node.attrs?.translationVersion}
            text={node.attrs?.text}
          />
        );

      case 'evidenceImage':
        return (
          <EvidenceImageDisplay
            key={index}
            primaryImage={node.attrs?.primaryImage}
            secondaryImage={node.attrs?.secondaryImage}
            caption={node.attrs?.caption}
            citation={node.attrs?.citation}
          />
        );

      case 'callout':
        return (
          <CalloutDisplay key={index} variant={node.attrs?.variant || 'info'}>
            {(node.content || []).map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child, i)}</React.Fragment>
            ))}
          </CalloutDisplay>
        );

      case 'footnote': {
        footnoteCounter++;
        const currentNum = footnoteCounter;
        const cit = node.attrs?.citation || {};

        const popoverContent = (
          <div className="text-left text-xs space-y-1">
            <p className="font-bold text-[var(--accent)]">
              [{currentNum}] {cit.title || 'Citation'}
            </p>
            {cit.author && <p className="text-[var(--text-muted)]">Author: {cit.author}</p>}
            {cit.publisher && <p className="text-[var(--text-muted)]">Publisher: {cit.publisher} ({cit.year || ''})</p>}
            {cit.page && <p className="text-[var(--text-muted)]">Page: {cit.page}</p>}
            {cit.url && (
              <a
                href={cit.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent)] underline block mt-1 text-[10px]"
              >
                View Online Source
              </a>
            )}
          </div>
        );

        const triggerMarker = (
          <sup className="ml-0.5 text-[var(--accent)] font-bold cursor-pointer hover:underline">
            [{currentNum}]
          </sup>
        );

        return <HoverPopover key={index} trigger={triggerMarker} content={popoverContent} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="w-full text-base leading-relaxed text-[var(--text-primary)]">
      {(content.content || []).map((node: any, i: number) => renderNode(node, i))}

      {/* Footnote reference list at body end */}
      <FootnoteReferenceList content={content} />
    </div>
  );
};

export default TipTapRenderer;

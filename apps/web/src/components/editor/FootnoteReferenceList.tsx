import React from 'react';
import { Icon } from '../icons';

interface FootnoteReferenceListProps {
  content: Record<string, any> | null | undefined;
}

export const FootnoteReferenceList: React.FC<FootnoteReferenceListProps> = ({ content }) => {
  if (!content || !content.content) return null;

  const citations: any[] = [];

  // Traverse TipTap JSON document tree to collect footnotes in document order per Prompt 09 §130
  const traverse = (node: any) => {
    if (!node) return;
    if (node.type === 'footnote' && node.attrs?.citation) {
      citations.push(node.attrs.citation);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);

  if (citations.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t-2 border-[var(--border)] text-left text-xs space-y-3">
      <h3 className="font-bold text-sm text-[var(--accent)] flex items-center gap-2">
        <Icon name="footnote" size={16} />
        <span>Footnote References ({citations.length})</span>
      </h3>
      <ol className="list-decimal list-inside space-y-2 text-[var(--text-muted)]">
        {citations.map((cit, idx) => (
          <li key={idx} className="leading-relaxed">
            <strong className="text-[var(--text-primary)]">{cit.title}</strong>
            {cit.author ? ` — ${cit.author}` : ''}
            {cit.publisher ? `, ${cit.publisher}` : ''}
            {cit.year ? ` (${cit.year})` : ''}
            {cit.page ? `, p. ${cit.page}` : ''}
            {cit.url && (
              <a
                href={cit.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--accent)] ml-2 underline"
              >
                <span>[Link]</span>
                <Icon name="external-link" size={10} />
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FootnoteReferenceList;

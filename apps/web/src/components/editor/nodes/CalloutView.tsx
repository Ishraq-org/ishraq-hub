import React from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Icon } from '../../icons';

export const CalloutView: React.FC<NodeViewProps> = (props) => {
  const variant = props.node.attrs.variant || 'info';

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100',
          badge: 'bg-amber-500 text-white',
          title: 'Warning & Caveat',
          icon: 'warning',
        };
      case 'answer':
        return {
          container: 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)] shadow-sm',
          badge: 'bg-[var(--accent)] text-[var(--bg-secondary)] font-extrabold',
          title: 'Core Scholarly Answer',
          icon: 'check-circle',
        };
      case 'summary':
        return {
          container: 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)]',
          badge: 'bg-[var(--text-muted)] text-white',
          title: 'Key Takeaways Summary',
          icon: 'type',
        };
      case 'claim':
        // Deliberately neutral/grey per Prompt 09 §115-117 to steelman opposing claim without visual endorsement
        return {
          container: 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] opacity-90',
          badge: 'bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)] font-semibold',
          title: 'Opposing Claim (Steelman)',
          icon: 'quote',
        };
      case 'info':
      default:
        return {
          container: 'border-blue-500/40 bg-blue-500/10 text-blue-900 dark:text-blue-100',
          badge: 'bg-blue-600 text-white',
          title: 'Contextual Information',
          icon: 'info',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <NodeViewWrapper className="my-6">
      <div className={`p-4 rounded-xl border ${style.container} space-y-2 text-left`}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${style.badge} flex items-center gap-1`}>
            <Icon name={style.icon} size={12} />
            <span>{style.title}</span>
          </span>
        </div>

        {/* Editable Nested TipTap Content */}
        <NodeViewContent className="prose max-w-none text-xs focus:outline-none min-h-[40px]" />
      </div>
    </NodeViewWrapper>
  );
};

export default CalloutView;

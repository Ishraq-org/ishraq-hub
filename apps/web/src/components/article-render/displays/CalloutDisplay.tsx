import React from 'react';
import { Icon } from '../../icons';

export interface CalloutDisplayProps {
  variant: 'warning' | 'info' | 'answer' | 'summary' | 'claim';
  children: React.ReactNode;
  headerControls?: React.ReactNode;
}

export const CalloutDisplay: React.FC<CalloutDisplayProps> = ({
  variant = 'info',
  children,
  headerControls,
}) => {
  const variantStyles = {
    warning: {
      border: 'border-amber-600/80 bg-amber-950/20 text-amber-200',
      icon: 'warning',
      label: 'Warning / Caution',
    },
    info: {
      border: 'border-sky-600/80 bg-sky-950/20 text-sky-200',
      icon: 'info',
      label: 'Information',
    },
    answer: {
      border: 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]',
      icon: 'check',
      label: 'Refutation Answer',
    },
    summary: {
      border: 'border-emerald-600/80 bg-emerald-950/20 text-emerald-200',
      icon: 'file-text',
      label: 'Summary Point',
    },
    // Claim variant rule (Master Prompt §5.6): neutral/grey styling to steelman opposing claims
    claim: {
      border: 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)]',
      icon: 'messagesquare',
      label: 'Opposing Claim / Objection',
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div className={`my-6 border-l-4 rounded-r-xl p-5 shadow-sm space-y-3 text-left ${style.border}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs font-bold">
        <div className="flex items-center gap-2">
          <Icon name={style.icon as any} size={16} />
          <span>{style.label}</span>
        </div>
        {headerControls}
      </div>

      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

export default CalloutDisplay;

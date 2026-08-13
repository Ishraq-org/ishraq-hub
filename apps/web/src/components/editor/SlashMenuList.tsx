import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SlashCommandItem } from './SlashMenuRegistry';
import { Icon } from '../icons';

export interface SlashMenuListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashMenuListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenuList = forwardRef<SlashMenuListRef, SlashMenuListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="p-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl">
          No matching block commands
        </div>
      );
    }

    return (
      <div className="w-64 max-h-80 overflow-y-auto p-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl space-y-1 text-xs z-50">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] mb-1">
          Insert Block Element
        </div>
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition-colors ${
                isSelected
                  ? 'bg-[var(--accent)] text-[var(--bg-secondary)] font-semibold'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-[var(--bg-primary)] text-[var(--accent)]'
                }`}
              >
                <Icon name={item.icon || 'type'} size={14} />
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold leading-tight">{item.title}</p>
                <p
                  className={`text-[10px] truncate ${
                    isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashMenuList.displayName = 'SlashMenuList';
export default SlashMenuList;

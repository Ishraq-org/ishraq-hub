import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Suggestion from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { ReactRenderer } from '@tiptap/react';
import SlashMenuList, { SlashMenuListRef } from './SlashMenuList';
import SlashMenuRegistry, { SlashCommandItem } from './SlashMenuRegistry';
import EditorToolbar from './EditorToolbar';
import { NodeInsertionModal, CustomNodeType } from './modals/NodeInsertionModal';
import FootnoteReferenceList from './FootnoteReferenceList';

import ArticleLinkMark from './marks/ArticleLinkMark';

// Custom Node Extensions
import QuranVerseNode from './nodes/QuranVerseNode';
import HadithNode from './nodes/HadithNode';
import BibleVerseNode from './nodes/BibleVerseNode';
import EvidenceImageNode from './nodes/EvidenceImageNode';
import CalloutNode from './nodes/CalloutNode';
import FootnoteNode from './nodes/FootnoteNode';

interface TipTapEditorProps {
  content: Record<string, any> | null | undefined;
  onChange?: (jsonContent: Record<string, any>) => void;
  editable?: boolean;
  language?: string;
}

const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command(editor);
          editor.commands.deleteRange(range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return SlashMenuRegistry.getItems(query);
        },
        render: () => {
          let component: ReactRenderer<SlashMenuListRef> | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashMenuList, {
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => {
                    props.command(item);
                  },
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate: (props: any) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => {
                  props.command(item);
                },
              });

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) || false;
            },

            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  editable = true,
  language = 'en',
}) => {
  const [activeModalNodeType, setActiveModalNodeType] = useState<CustomNodeType | null>(null);

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ArticleLinkMark,
      // Contextual Ghost Guidance Placeholder Extension (Prompt 14 §20-33)
      Placeholder.configure({
        placeholder: ({ node, pos, editor }: any) => {
          try {
            const parentNode = editor.state.doc.resolve(pos).parent;
            if (parentNode && parentNode.type.name === 'callout') {
              const variant = parentNode.attrs?.variant;
              if (variant === 'claim') {
                return "State the opponent's central claim fairly and clearly — what exactly is being claimed?";
              }
              if (variant === 'answer') {
                return 'Give your core answer here. The reader should understand your position before the detailed explanation.';
              }
              if (variant === 'summary') {
                return 'Summarize the logical flow: Claim → Answer → Evidence → Explanation → Conclusion.';
              }
            }
          } catch {
            // Ignore resolution edge cases
          }

          if (node.type.name === 'paragraph') {
            return "Type '/' for custom blocks or write content here...";
          }
          return 'Write content...';
        },
      }),
      SlashCommandExtension,
      // All 6 Custom Node Extensions
      QuranVerseNode,
      HadithNode,
      BibleVerseNode,
      EvidenceImageNode,
      CalloutNode,
      FootnoteNode,
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
  });

  // Listen for open-node-modal events dispatched from SlashMenuRegistry
  useEffect(() => {
    const handleOpenModal = (e: any) => {
      if (e.detail?.nodeType) {
        setActiveModalNodeType(e.detail.nodeType);
      }
    };

    window.addEventListener('open-node-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-node-modal', handleOpenModal);
    };
  }, []);

  const handleConfirmNodeInsertion = (nodeType: CustomNodeType, attrs: Record<string, any>) => {
    if (!editor) return;

    if (nodeType === 'callout') {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs,
          content: [
            {
              type: 'paragraph',
            },
          ],
        })
        .run();
    } else {
      editor.chain().focus().insertContent({ type: nodeType, attrs }).run();
    }

    setActiveModalNodeType(null);
  };

  return (
    <div className="w-full border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] overflow-hidden shadow-sm flex flex-col min-h-[450px]">
      {editable && <EditorToolbar editor={editor} language={language} />}

      <div className="flex-1 p-6 text-[var(--text-primary)] prose max-w-none focus:outline-none">
        <EditorContent editor={editor} className="min-h-[350px] outline-none" />

        {/* Auto-collected Footnote References at end of article body per Prompt 09 §130 */}
        <FootnoteReferenceList content={editor?.getJSON()} />
      </div>

      {/* Node Insertion Modal */}
      <NodeInsertionModal
        nodeType={activeModalNodeType}
        onClose={() => setActiveModalNodeType(null)}
        onConfirm={handleConfirmNodeInsertion}
      />
    </div>
  );
};

export default TipTapEditor;

export const generateShubhaScaffold = (): Record<string, any> => {
  return {
    type: 'doc',
    content: [
      // 1. Hook Paragraph (Empty node with ghost placeholder guidance)
      {
        type: 'paragraph',
      },
      // 2. Opposing Claim Callout Box
      {
        type: 'callout',
        attrs: { variant: 'claim' },
        content: [
          {
            type: 'paragraph',
          },
        ],
      },
      // 3. Core Refutation Answer Callout Box
      {
        type: 'callout',
        attrs: { variant: 'answer' },
        content: [
          {
            type: 'paragraph',
          },
        ],
      },
      // 4. Step-by-Step Explanation Paragraph
      {
        type: 'paragraph',
      },
      // 5. Analogy or Visual Example Paragraph
      {
        type: 'paragraph',
      },
      // 6. REAL Heading Node (Persisted structural heading per Prompt 14 §55)
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [
          {
            type: 'text',
            text: 'Evidence & Sources',
          },
        ],
      },
      // 7. Evidence Insertion Paragraph
      {
        type: 'paragraph',
      },
      // 8. Final Answer Synthesis Paragraph
      {
        type: 'paragraph',
      },
      // 9. Logical Summary Callout Box
      {
        type: 'callout',
        attrs: { variant: 'summary' },
        content: [
          {
            type: 'paragraph',
          },
        ],
      },
    ],
  };
};

export default generateShubhaScaffold;

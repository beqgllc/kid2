import type { ReactNode } from 'react';

type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string };

function inlineText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part);
}

export function RichContent({ blocks }: { blocks: ContentBlock[] }) {
  return <>
    {blocks.map((block, index) => {
      if (block.type === 'heading') {
        return block.level === 2
          ? <h2 key={index}>{inlineText(block.text)}</h2>
          : <h3 key={index}>{inlineText(block.text)}</h3>;
      }
      if (block.type === 'list') return <ul key={index}>{block.items.map(item => <li key={item}>{inlineText(item)}</li>)}</ul>;
      if (block.type === 'quote') return <blockquote key={index}>{inlineText(block.text)}</blockquote>;
      return <p key={index}>{inlineText(block.text)}</p>;
    })}
  </>;
}

export type { ContentBlock };

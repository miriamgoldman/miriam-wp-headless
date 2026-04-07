import type { JSX } from 'react';
import { CoreHeadingBlock } from '@/lib/wordpress/types';

const alignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const levelClass: Record<number, string> = {
  1: 'text-4xl font-bold mt-10 mb-4',
  2: 'text-3xl font-bold mt-8 mb-3',
  3: 'text-2xl font-semibold mt-6 mb-3',
  4: 'text-xl font-semibold mt-6 mb-2',
  5: 'text-lg font-semibold mt-4 mb-2',
  6: 'text-base font-semibold mt-4 mb-2',
};

export default function CoreHeading({ block }: { block: CoreHeadingBlock }) {
  const { content, level = 2, textAlign } = block.attributes;

  if (!content) return null;

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const className = [
    'text-gray-900',
    levelClass[level] ?? levelClass[2],
    textAlign ? (alignClass[textAlign] ?? '') : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: content }} />;
}

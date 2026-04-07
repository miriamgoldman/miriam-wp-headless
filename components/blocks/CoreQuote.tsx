import { CoreQuoteBlock } from '@/lib/wordpress/types';

export default function CoreQuote({ block }: { block: CoreQuoteBlock }) {
  const { value, citation } = block.attributes;

  if (!value) return null;

  return (
    <blockquote className="my-8 border-l-4 border-blue-500 pl-6 py-1">
      <div
        className="text-xl italic text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: value }}
      />
      {citation && (
        <cite
          className="mt-3 block text-sm text-gray-500 not-italic"
          dangerouslySetInnerHTML={{ __html: citation }}
        />
      )}
    </blockquote>
  );
}

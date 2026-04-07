import { CorePullquoteBlock } from '@/lib/wordpress/types';

export default function CorePullquote({ block }: { block: CorePullquoteBlock }) {
  const { pullquoteValue: value, citation, textAlign } = block.attributes;

  if (!value) return null;

  const alignClass = textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center';

  return (
    <figure className={`my-10 px-8 py-6 border-y-2 border-gray-900 ${alignClass}`}>
      <blockquote
        className="text-2xl font-semibold italic text-gray-900 leading-snug"
        dangerouslySetInnerHTML={{ __html: value }}
      />
      {citation && (
        <figcaption
          className="mt-4 text-sm text-gray-500 not-italic"
          dangerouslySetInnerHTML={{ __html: citation }}
        />
      )}
    </figure>
  );
}

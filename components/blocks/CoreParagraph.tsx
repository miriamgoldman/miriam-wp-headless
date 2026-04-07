import { CoreParagraphBlock } from '@/lib/wordpress/types';

const alignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export default function CoreParagraph({ block }: { block: CoreParagraphBlock }) {
  const { content, align } = block.attributes;

  if (!content) return null;

  return (
    <p
      className={`my-4 leading-relaxed text-gray-800 ${align ? (alignClass[align] ?? '') : ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

import { CoreCodeBlock } from '@/lib/wordpress/types';

export default function CoreCode({ block }: { block: CoreCodeBlock }) {
  const { content } = block.attributes;

  if (!content) return null;

  return (
    <pre className="my-6 overflow-x-auto rounded-lg bg-gray-900 p-6">
      <code
        className="text-sm text-green-300 font-mono leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </pre>
  );
}

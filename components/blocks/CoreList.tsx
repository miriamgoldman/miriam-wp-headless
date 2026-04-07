import { CoreListBlock } from '@/lib/wordpress/types';

export default function CoreList({ block }: { block: CoreListBlock }) {
  const { ordered, values } = block.attributes;

  if (!values) return null;

  const Tag = ordered ? 'ol' : 'ul';
  const listClass = ordered
    ? 'my-4 ml-6 list-decimal space-y-1 text-gray-800'
    : 'my-4 ml-6 list-disc space-y-1 text-gray-800';

  return (
    <Tag
      className={listClass}
      dangerouslySetInnerHTML={{ __html: values }}
    />
  );
}

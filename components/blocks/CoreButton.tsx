import { CoreButtonBlock } from '@/lib/wordpress/types';

export default function CoreButton({ block }: { block: CoreButtonBlock }) {
  const { text, url, linkTarget, rel, className } = block.attributes;

  if (!text || !url) return null;

  const isOutline = className?.includes('is-style-outline');

  const buttonClass = isOutline
    ? 'inline-block px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors'
    : 'inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors';

  return (
    <a
      href={url}
      target={linkTarget ?? '_self'}
      rel={rel ?? undefined}
      className={buttonClass}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

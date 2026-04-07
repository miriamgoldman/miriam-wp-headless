import Image from 'next/image';
import { CoreImageBlock } from '@/lib/wordpress/types';

const alignClass: Record<string, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
  wide: 'w-full',
  full: 'w-full',
};

export default function CoreImage({ block }: { block: CoreImageBlock }) {
  const { url, alt = '', caption, width, height, align, href } = block.attributes;

  if (!url) return null;

  const w = width ?? 800;
  const h = height ?? 600;
  const wrapperClass = `my-6 ${align ? (alignClass[align] ?? '') : 'mx-auto'}`;

  const img = (
    <figure className={wrapperClass}>
      <Image
        src={url}
        alt={alt}
        width={w}
        height={h}
        className="rounded-lg object-cover"
      />
      {caption && (
        <figcaption
          className="mt-2 text-sm text-center text-gray-500"
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      )}
    </figure>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}

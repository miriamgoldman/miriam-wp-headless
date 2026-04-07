import type { JSX } from 'react';
import { CoreCoverBlock, BlockNode } from '@/lib/wordpress/types';
import BlockRenderer from './BlockRenderer';

const contentPositionClass: Record<string, string> = {
  'top left': 'items-start justify-start text-left',
  'top center': 'items-start justify-center text-center',
  'top right': 'items-start justify-end text-right',
  'center left': 'items-center justify-start text-left',
  'center center': 'items-center justify-center text-center',
  'center right': 'items-center justify-end text-right',
  'bottom left': 'items-end justify-start text-left',
  'bottom center': 'items-end justify-center text-center',
  'bottom right': 'items-end justify-end text-right',
};

interface CoreCoverProps {
  block: CoreCoverBlock;
  children: BlockNode[];
}

export default function CoreCover({ block, children }: CoreCoverProps) {
  const {
    url,
    alt = '',
    dimRatio = 50,
    customOverlayColor,
    overlayColor,
    minHeight,
    minHeightUnit = 'px',
    contentPosition = 'center center',
    isDark = false,
    tagName = 'div',
  } = block.attributes;

  const Tag = tagName as keyof JSX.IntrinsicElements;

  // isDark: true = dark overlay, light text. isDark: false = light overlay, dark text.
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const overlayOpacity = dimRatio / 100;
  const resolvedOverlayColor = customOverlayColor ?? overlayColor ?? (isDark ? '#000000' : '#ffffff');
  const minHeightStyle = minHeight ? `${minHeight}${minHeightUnit}` : '400px';
  const flexPosition = contentPositionClass[contentPosition] ?? 'items-center justify-center text-center';

  return (
    <Tag
      className={`relative -mx-4 sm:-mx-6 lg:-mx-8 my-6 flex ${flexPosition} overflow-hidden`}
      style={{ minHeight: minHeightStyle }}
    >
      {url && (
        <img
          src={url}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0"
        style={{ backgroundColor: resolvedOverlayColor, opacity: overlayOpacity }}
        aria-hidden="true"
      />

      <div className={`relative z-10 w-full px-8 py-12 ${textColor} [&_*]:!text-inherit [&_p]:text-2xl [&_p]:font-semibold [&_p]:leading-snug`}>
        <BlockRenderer blocks={children} />
      </div>
    </Tag>
  );
}

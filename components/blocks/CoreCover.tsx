import type { JSX } from 'react';
import { CoreCoverBlock, BlockNode } from '@/lib/wordpress/types';
import BlockRenderer from './BlockRenderer';

const contentPositionClass: Record<string, string> = {
  'top left': 'items-start justify-start',
  'top center': 'items-start justify-center',
  'top right': 'items-start justify-end',
  'center left': 'items-center justify-start',
  'center center': 'items-center justify-center',
  'center right': 'items-center justify-end',
  'bottom left': 'items-end justify-start',
  'bottom center': 'items-end justify-center',
  'bottom right': 'items-end justify-end',
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
    minHeight,
    minHeightUnit = 'px',
    contentPosition = 'center center',
    isDark = false,
    tagName = 'div',
  } = block.attributes;

  const Tag = tagName as keyof JSX.IntrinsicElements;
  const overlayOpacity = dimRatio / 100;
  const overlayColor = customOverlayColor ?? '#000000';
  const minHeightStyle = minHeight ? `${minHeight}${minHeightUnit}` : '400px';
  const flexPosition = contentPositionClass[contentPosition] ?? 'items-center justify-center';
  const textColor = isDark ? 'text-gray-900' : 'text-white';

  return (
    <Tag
      className={`relative my-6 flex ${flexPosition} overflow-hidden rounded-lg`}
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
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        aria-hidden="true"
      />

      <div className={`relative z-10 w-full max-w-3xl px-8 py-12 ${textColor}`}>
        <BlockRenderer blocks={children} />
      </div>
    </Tag>
  );
}

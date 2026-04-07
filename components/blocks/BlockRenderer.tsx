import type { JSX } from 'react';
import { EditorBlock, BlockNode, CoreParagraphBlock, CoreHeadingBlock, CoreImageBlock, CoreQuoteBlock, CoreListBlock, CoreCodeBlock, CoreSeparatorBlock, CoreButtonBlock, CoreButtonsBlock, CoreColumnBlock, CoreColumnsBlock, CoreGroupBlock, CoreCoverBlock, CorePullquoteBlock } from '@/lib/wordpress/types';
import CoreParagraph from './CoreParagraph';
import CoreHeading from './CoreHeading';
import CoreImage from './CoreImage';
import CoreQuote from './CoreQuote';
import CoreList from './CoreList';
import CoreCode from './CoreCode';
import CoreSeparator from './CoreSeparator';
import CoreButton from './CoreButton';
import CoreCover from './CoreCover';
import CorePullquote from './CorePullquote';

/**
 * Reconstruct the flat editorBlocks list into a tree using clientId / parentClientId.
 */
function buildTree(blocks: EditorBlock[]): BlockNode[] {
  const map = new Map<string, BlockNode>();
  const roots: BlockNode[] = [];

  for (const block of blocks) {
    map.set(block.clientId, { ...block, children: [] });
  }

  for (const node of map.values()) {
    if (node.parentClientId && map.has(node.parentClientId)) {
      map.get(node.parentClientId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function Block({ node }: { node: BlockNode }) {
  switch (node.__typename) {
    case 'CoreParagraph':
      return <CoreParagraph block={node as unknown as CoreParagraphBlock} />;

    case 'CoreHeading':
      return <CoreHeading block={node as unknown as CoreHeadingBlock} />;

    case 'CoreImage':
      return <CoreImage block={node as unknown as CoreImageBlock} />;

    case 'CoreQuote':
      return <CoreQuote block={node as unknown as CoreQuoteBlock} />;

    case 'CoreCover':
      return <CoreCover block={node as unknown as CoreCoverBlock} children={node.children} />;

    case 'CorePullquote':
      return <CorePullquote block={node as unknown as CorePullquoteBlock} />;

    case 'CoreList':
      return <CoreList block={node as unknown as CoreListBlock} />;

    case 'CoreCode':
      return <CoreCode block={node as unknown as CoreCodeBlock} />;

    case 'CoreSeparator':
      return <CoreSeparator block={node as unknown as CoreSeparatorBlock} />;

    case 'CoreButton':
      return <CoreButton block={node as unknown as CoreButtonBlock} />;

    case 'CoreButtons': {
      const attrs = node.attributes as CoreButtonsBlock['attributes'] | undefined;
      const isVertical = (attrs?.layout as Record<string, unknown> | undefined)?.orientation === 'vertical';
      return (
        <div className={`my-6 flex flex-wrap gap-3 ${isVertical ? 'flex-col items-start' : 'items-center'}`}>
          <BlockList nodes={node.children} />
        </div>
      );
    }

    case 'CoreColumn': {
      const attrs = node.attributes as CoreColumnBlock['attributes'] | undefined;
      const style = attrs?.width ? { flexBasis: attrs.width, flexGrow: 0 } : { flex: 1 };
      return (
        <div style={style} className="min-w-0">
          <BlockList nodes={node.children} />
        </div>
      );
    }

    case 'CoreColumns': {
      const attrs = node.attributes as CoreColumnsBlock['attributes'] | undefined;
      const isStackedOnMobile = attrs?.isStackedOnMobile ?? true;
      return (
        <div className={`my-6 flex gap-6 ${isStackedOnMobile ? 'flex-col md:flex-row' : 'flex-row'}`}>
          <BlockList nodes={node.children} />
        </div>
      );
    }

    case 'CoreGroup': {
      const attrs = node.attributes as CoreGroupBlock['attributes'] | undefined;
      const Tag = (attrs?.tagName ?? 'div') as keyof JSX.IntrinsicElements;
      return (
        <Tag className="my-6">
          <BlockList nodes={node.children} />
        </Tag>
      );
    }

    default:
      // Unknown block — fall back to WordPress-rendered HTML
      if (node.renderedHtml) {
        return (
          <div
            className="wp-block-fallback"
            dangerouslySetInnerHTML={{ __html: node.renderedHtml }}
          />
        );
      }
      return null;
  }
}

function BlockList({ nodes }: { nodes: BlockNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <Block key={node.clientId} node={node} />
      ))}
    </>
  );
}

interface BlockRendererProps {
  blocks: EditorBlock[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  const tree = buildTree(blocks);
  return (
    <div className="block-renderer">
      <BlockList nodes={tree} />
    </div>
  );
}

/**
 * WordPress GraphQL Types
 */

export interface FeaturedImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails?: {
      width: number;
      height: number;
    };
  };
}

export interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  date: string;
  modified: string;
  featuredImage?: FeaturedImage;
  author?: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
  categories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  tags?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  editorBlocks?: EditorBlock[];
}

export interface Page {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  content: string;
  date: string;
  modified: string;
  featuredImage?: FeaturedImage;
  parent?: {
    node: {
      slug: string;
    };
  };
  editorBlocks?: EditorBlock[];
}

export interface PostsConnection {
  nodes: Post[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

// ============================================================================
// Editor Blocks
// ============================================================================

export interface EditorBlock {
  __typename: string;
  name: string;
  clientId: string;
  parentClientId: string | null;
  renderedHtml: string | null;
  attributes?: Record<string, unknown>;
}

export interface CoreParagraphBlock extends EditorBlock {
  __typename: 'CoreParagraph';
  attributes: {
    content: string;
    align?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    style?: Record<string, unknown>;
  };
}

export interface CoreHeadingBlock extends EditorBlock {
  __typename: 'CoreHeading';
  attributes: {
    content: string;
    level: number;
    textAlign?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface CoreImageBlock extends EditorBlock {
  __typename: 'CoreImage';
  attributes: {
    url?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
    align?: string;
    href?: string;
    sizeSlug?: string;
  };
}

export interface CoreQuoteBlock extends EditorBlock {
  __typename: 'CoreQuote';
  attributes: {
    value?: string;
    citation?: string;
    align?: string;
  };
}

export interface CoreListBlock extends EditorBlock {
  __typename: 'CoreList';
  attributes: {
    ordered: boolean;
    values: string;
  };
}

export interface CoreCodeBlock extends EditorBlock {
  __typename: 'CoreCode';
  attributes: {
    content: string;
  };
}

export interface CoreSeparatorBlock extends EditorBlock {
  __typename: 'CoreSeparator';
  attributes: {
    opacity?: string;
    style?: Record<string, unknown>;
  };
}

export interface CoreButtonBlock extends EditorBlock {
  __typename: 'CoreButton';
  attributes: {
    text?: string;
    url?: string;
    linkTarget?: string;
    rel?: string;
    backgroundColor?: string;
    textColor?: string;
    className?: string;
  };
}

export interface CoreButtonsBlock extends EditorBlock {
  __typename: 'CoreButtons';
  attributes: {
    layout?: Record<string, unknown>;
  };
}

export interface CoreColumnBlock extends EditorBlock {
  __typename: 'CoreColumn';
  attributes: {
    width?: string;
    verticalAlignment?: string;
  };
}

export interface CoreColumnsBlock extends EditorBlock {
  __typename: 'CoreColumns';
  attributes: {
    isStackedOnMobile?: boolean;
    verticalAlignment?: string;
  };
}

export interface CoreGroupBlock extends EditorBlock {
  __typename: 'CoreGroup';
  attributes: {
    tagName?: string;
    backgroundColor?: string;
    textColor?: string;
    style?: Record<string, unknown>;
  };
}

export interface CoreMediaTextBlock extends EditorBlock {
  __typename: 'CoreMediaText';
  attributes: {
    mediaUrl?: string;
    mediaAlt?: string;
    mediaType?: string;
    mediaWidth?: number;
    isStackedOnMobile?: boolean;
    imageFill?: boolean;
    verticalAlignment?: string;
  };
}

export interface CoreCoverBlock extends EditorBlock {
  __typename: 'CoreCover';
  attributes: {
    url?: string;
    alt?: string;
    dimRatio?: number;
    overlayColor?: string;
    customOverlayColor?: string;
    minHeight?: number;
    minHeightUnit?: string;
    contentPosition?: string;
    isDark?: boolean;
    backgroundType?: string;
    tagName?: string;
  };
}

export interface CorePullquoteBlock extends EditorBlock {
  __typename: 'CorePullquote';
  attributes: {
    pullquoteValue?: string;
    citation?: string;
    textAlign?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

// Tree node used by BlockRenderer after reconstruction
export interface BlockNode extends EditorBlock {
  children: BlockNode[];
}

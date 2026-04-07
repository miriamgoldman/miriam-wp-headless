export const FEATURED_IMAGE_FIELDS = `
  fragment FeaturedImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

export const AUTHOR_FIELDS = `
  fragment AuthorFields on User {
    name
    avatar {
      url
    }
  }
`;

export const EDITOR_BLOCKS_FIELDS = `
  fragment EditorBlocksFields on EditorBlock {
    __typename
    name
    clientId
    parentClientId
    renderedHtml
    ... on CoreParagraph {
      attributes {
        content
        align
        textColor
        backgroundColor
        fontSize
      }
    }
    ... on CoreHeading {
      attributes {
        content
        level
        textAlign
        textColor
        backgroundColor
      }
    }
    ... on CoreImage {
      attributes {
        url
        alt
        caption
        width
        height
        align
        href
        sizeSlug
      }
    }
    ... on CoreQuote {
      attributes {
        value
        citation
        align
      }
    }
    ... on CoreList {
      attributes {
        ordered
        values
      }
    }
    ... on CoreCode {
      attributes {
        content
      }
    }
    ... on CoreSeparator {
      attributes {
        opacity
      }
    }
    ... on CoreButton {
      attributes {
        text
        url
        linkTarget
        rel
        backgroundColor
        textColor
        className
      }
    }
    ... on CoreButtons {
      attributes {
        layout
      }
    }
    ... on CoreColumn {
      attributes {
        width
        verticalAlignment
      }
    }
    ... on CoreColumns {
      attributes {
        isStackedOnMobile
        verticalAlignment
      }
    }
    ... on CoreGroup {
      attributes {
        tagName
        backgroundColor
        textColor
      }
    }
    ... on CoreMediaText {
      attributes {
        mediaUrl
        mediaAlt
        mediaType
        mediaWidth
        isStackedOnMobile
        imageFill
        verticalAlignment
      }
    }
    ... on CoreCover {
      attributes {
        url
        alt
        dimRatio
        overlayColor
        customOverlayColor
        minHeight
        minHeightUnit
        contentPosition
        isDark
        backgroundType
        tagName
      }
    }
    ... on CorePullquote {
      attributes {
        pullquoteValue: value
        citation
        textAlign
        backgroundColor
        textColor
      }
    }
  }
`;

export const POST_FIELDS = `
  fragment PostFields on Post {
    id
    databaseId
    title
    slug
    content
    excerpt
    date
    modified
    featuredImage {
      node {
        ...FeaturedImageFields
      }
    }
    author {
      node {
        ...AuthorFields
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
    }
    tags {
      nodes {
        id
        name
        slug
      }
    }
    editorBlocks {
      ...EditorBlocksFields
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${AUTHOR_FIELDS}
  ${EDITOR_BLOCKS_FIELDS}
`;

export const PAGE_FIELDS = `
  fragment PageFields on Page {
    id
    databaseId
    title
    slug
    content
    date
    modified
    featuredImage {
      node {
        ...FeaturedImageFields
      }
    }
    parent {
      node {
        slug
      }
    }
    editorBlocks {
      ...EditorBlocksFields
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${EDITOR_BLOCKS_FIELDS}
`;

export const POST_CARD_FIELDS = `
  fragment PostCardFields on Post {
    id
    databaseId
    title
    slug
    excerpt
    date
    featuredImage {
      node {
        ...FeaturedImageFields
      }
    }
    author {
      node {
        ...AuthorFields
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${AUTHOR_FIELDS}
`;

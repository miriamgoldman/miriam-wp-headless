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
  // Future: ACF fields
  acfFields?: Record<string, any>;
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
  // Future: ACF flexible content
  flexibleContent?: FlexibleContentBlock[];
}

export interface FlexibleContentBlock {
  fieldGroupName: string;
  // Additional fields will be added as ACF is configured
  [key: string]: any;
}

export interface PostsConnection {
  nodes: Post[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface PagesConnection {
  nodes: Page[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

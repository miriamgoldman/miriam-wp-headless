import { fetchGraphQL } from './client';
import { POST_FIELDS, POST_CARD_FIELDS, PAGE_FIELDS } from './fragments';
import { Post, Page, PostsConnection, PagesConnection } from './types';

/**
 * Get all post slugs for static generation
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const query = `
    query GetAllPostSlugs {
      posts(first: 1000, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  const response = await fetchGraphQL<{ posts: { nodes: Array<{ slug: string }> } }>(
    query,
    {},
    { tags: ['posts'], revalidate: 3600 }
  );

  return response.data?.posts.nodes.map((node) => node.slug) || [];
}

/**
 * Get all page slugs for static generation
 */
export async function getAllPageSlugs(): Promise<string[]> {
  const query = `
    query GetAllPageSlugs {
      pages(first: 1000, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  const response = await fetchGraphQL<{ pages: { nodes: Array<{ slug: string }> } }>(
    query,
    {},
    { tags: ['pages'], revalidate: 3600 }
  );

  return response.data?.pages.nodes.map((node) => node.slug) || [];
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        ...PostFields
      }
    }
    ${POST_FIELDS}
  `;

  const response = await fetchGraphQL<{ post: Post }>(
    query,
    { slug },
    { tags: ['posts', `post-${slug}`], revalidate: 3600 }
  );

  return response.data?.post || null;
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const query = `
    query GetPageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        ...PageFields
      }
    }
    ${PAGE_FIELDS}
  `;

  const response = await fetchGraphQL<{ page: Page }>(
    query,
    { slug },
    { tags: ['pages', `page-${slug}`], revalidate: 3600 }
  );

  return response.data?.page || null;
}

/**
 * Get recent posts with pagination
 */
export async function getRecentPosts(
  first: number = 10,
  after?: string
): Promise<PostsConnection> {
  const query = `
    query GetRecentPosts($first: Int!, $after: String) {
      posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          ...PostCardFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    ${POST_CARD_FIELDS}
  `;

  const response = await fetchGraphQL<{ posts: PostsConnection }>(
    query,
    { first, after },
    { tags: ['posts'], revalidate: 1800 }
  );

  return (
    response.data?.posts || {
      nodes: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  );
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  categorySlug: string,
  first: number = 10
): Promise<Post[]> {
  const query = `
    query GetPostsByCategory($categorySlug: String!, $first: Int!) {
      posts(first: $first, where: { categoryName: $categorySlug, status: PUBLISH }) {
        nodes {
          ...PostCardFields
        }
      }
    }
    ${POST_CARD_FIELDS}
  `;

  const response = await fetchGraphQL<{ posts: { nodes: Post[] } }>(
    query,
    { categorySlug, first },
    { tags: ['posts', `category-${categorySlug}`], revalidate: 3600 }
  );

  return response.data?.posts.nodes || [];
}

/**
 * Get site settings and general information
 */
export async function getSiteSettings() {
  const query = `
    query GetSiteSettings {
      generalSettings {
        title
        description
        url
        language
      }
    }
  `;

  const response = await fetchGraphQL<{
    generalSettings: {
      title: string;
      description: string;
      url: string;
      language: string;
    };
  }>(query, {}, { tags: ['settings'], revalidate: 86400 });

  return response.data?.generalSettings || null;
}

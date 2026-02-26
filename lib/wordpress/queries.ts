import { cacheLife, cacheTag } from 'next/cache';
import { fetchGraphQL } from './client';
import { POST_FIELDS, POST_CARD_FIELDS, PAGE_FIELDS } from './fragments';
import { Post, Page, PostsConnection } from './types';

/**
 * Generate surrogate keys from a Post (matches WordPress plugin pattern)
 * Keys: post-{id}, post-{slug}, post-list, term-{categoryId}, term-{tagId}
 */
function generatePostSurrogateKeys(post: Post): string[] {
  const keys: string[] = [];

  keys.push(`post-${post.databaseId}`);
  keys.push(`post-${post.slug}`);
  keys.push('post-list');

  // Add category term keys
  if (post.categories?.nodes) {
    post.categories.nodes.forEach((category) => {
      // Extract numeric ID from GraphQL global ID (e.g., "dGVybTox" -> "1")
      const numericId = category.id.match(/\d+$/)?.[0] || category.id;
      keys.push(`term-${numericId}`);
    });
  }

  // Add tag term keys
  if (post.tags?.nodes) {
    post.tags.nodes.forEach((tag) => {
      const numericId = tag.id.match(/\d+$/)?.[0] || tag.id;
      keys.push(`term-${numericId}`);
    });
  }

  return [...new Set(keys)]; // Remove duplicates
}

/**
 * Generate surrogate keys from a Page
 * Keys: page-{id}, page-{slug}, page-list
 */
function generatePageSurrogateKeys(page: Page): string[] {
  const keys: string[] = [];

  keys.push(`page-${page.databaseId}`);
  keys.push(`page-${page.slug}`);
  keys.push('page-list');

  return [...new Set(keys)];
}

// ============================================================================
// LOW-LEVEL FETCH FUNCTIONS
// These call GraphQL and tag the fetch-level cache
// ============================================================================

async function fetchAllPostSlugs(): Promise<{ slugs: string[]; surrogateKeys: string[] }> {
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
    { tags: ['post-list'] }
  );

  const slugs = response.data?.posts.nodes.map((node) => node.slug) || [];
  return { slugs, surrogateKeys: ['post-list'] };
}

async function fetchAllPageSlugs(): Promise<{ slugs: string[]; surrogateKeys: string[] }> {
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
    { tags: ['page-list'] }
  );

  const slugs = response.data?.pages.nodes.map((node) => node.slug) || [];
  return { slugs, surrogateKeys: ['page-list'] };
}

async function fetchSinglePost(slug: string): Promise<{ post: Post | null; surrogateKeys: string[] }> {
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
    { tags: [`post-${slug}`, 'post-list'] }
  );

  const post = response.data?.post || null;
  const surrogateKeys = post ? generatePostSurrogateKeys(post) : [`post-${slug}`];

  return { post, surrogateKeys };
}

async function fetchSinglePage(slug: string): Promise<{ page: Page | null; surrogateKeys: string[] }> {
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
    { tags: [`page-${slug}`, 'page-list'] }
  );

  const page = response.data?.page || null;
  const surrogateKeys = page ? generatePageSurrogateKeys(page) : [`page-${slug}`];

  return { page, surrogateKeys };
}

async function fetchRecentPostsData(
  first: number,
  after?: string
): Promise<{ posts: PostsConnection; surrogateKeys: string[] }> {
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
    { tags: ['post-list'] }
  );

  const posts = response.data?.posts || {
    nodes: [],
    pageInfo: { hasNextPage: false, endCursor: null },
  };

  // Generate surrogate keys from all returned posts
  const allKeys = posts.nodes.flatMap((post) => generatePostSurrogateKeys(post));
  const uniqueKeys = [...new Set(allKeys)];

  return { posts, surrogateKeys: uniqueKeys };
}

async function fetchPostsByCategoryData(
  categorySlug: string,
  first: number
): Promise<{ posts: Post[]; surrogateKeys: string[] }> {
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
    { tags: [`category-${categorySlug}`, 'post-list'] }
  );

  const posts = response.data?.posts.nodes || [];
  const allKeys = posts.flatMap((post) => generatePostSurrogateKeys(post));
  const uniqueKeys = [...new Set(allKeys)];

  return { posts, surrogateKeys: uniqueKeys };
}

async function fetchSiteSettingsData(): Promise<{
  settings: {
    title: string;
    description: string;
    url: string;
    language: string;
  } | null;
  surrogateKeys: string[];
}> {
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
  }>(query, {}, { tags: ['settings'] });

  return {
    settings: response.data?.generalSettings || null,
    surrogateKeys: ['settings'],
  };
}

// ============================================================================
// CACHED WRAPPER FUNCTIONS WITH 'use cache'
// These use infinite cache life and rely entirely on tag-based revalidation
// ============================================================================

/**
 * Get all post slugs (cached with 'use cache')
 */
export async function getAllPostSlugs(): Promise<string[]> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { slugs, surrogateKeys } = await fetchAllPostSlugs();
    surrogateKeys.forEach((key) => cacheTag(key));
    return slugs;
  } catch (error) {
    console.warn('Unable to fetch post slugs at build time, will use ISR:', error);
    return [];
  }
}

/**
 * Get all page slugs (cached with 'use cache')
 */
export async function getAllPageSlugs(): Promise<string[]> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { slugs, surrogateKeys } = await fetchAllPageSlugs();
    surrogateKeys.forEach((key) => cacheTag(key));
    return slugs;
  } catch (error) {
    console.warn('Unable to fetch page slugs at build time, will use ISR:', error);
    return [];
  }
}

/**
 * Get a single post by slug (cached with 'use cache')
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { post, surrogateKeys } = await fetchSinglePost(slug);
    surrogateKeys.forEach((key) => cacheTag(key));
    return post;
  } catch (error) {
    console.warn(`Unable to fetch post with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Get a single page by slug (cached with 'use cache')
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { page, surrogateKeys } = await fetchSinglePage(slug);
    surrogateKeys.forEach((key) => cacheTag(key));
    return page;
  } catch (error) {
    console.warn(`Unable to fetch page with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Get recent posts with pagination (cached with 'use cache')
 */
export async function getRecentPosts(first: number = 10, after?: string): Promise<PostsConnection> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { posts, surrogateKeys } = await fetchRecentPostsData(first, after);
    surrogateKeys.forEach((key) => cacheTag(key));
    return posts;
  } catch (error) {
    console.warn('Unable to fetch recent posts:', error);
    return {
      nodes: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Get posts by category (cached with 'use cache')
 */
export async function getPostsByCategory(categorySlug: string, first: number = 10): Promise<Post[]> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { posts, surrogateKeys } = await fetchPostsByCategoryData(categorySlug, first);
    surrogateKeys.forEach((key) => cacheTag(key));
    return posts;
  } catch (error) {
    console.warn(`Unable to fetch posts for category "${categorySlug}":`, error);
    return [];
  }
}

/**
 * Get site settings (cached with 'use cache')
 */
export async function getSiteSettings() {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { settings, surrogateKeys } = await fetchSiteSettingsData();
    surrogateKeys.forEach((key) => cacheTag(key));
    return settings;
  } catch (error) {
    console.warn('Unable to fetch site settings:', error);
    return null;
  }
}

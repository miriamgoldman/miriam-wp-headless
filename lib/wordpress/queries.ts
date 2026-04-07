import { cacheLife, cacheTag } from 'next/cache';
import { fetchGraphQL } from './client';
import { POST_FIELDS, PAGE_FIELDS, POST_CARD_FIELDS } from './fragments';
import { Post, Page, PostsConnection } from './types';

/**
 * Extract numeric ID from a WPGraphQL global ID (base64-encoded like "cG9zdDoxMjM=")
 */
function extractNumericId(globalId: string): string {
  try {
    const decoded = atob(globalId);
    const match = decoded.match(/:(\d+)$/);
    return match ? match[1] : globalId;
  } catch {
    return globalId;
  }
}

/**
 * Generate surrogate keys from a Post
 */
function generatePostSurrogateKeys(post: Post): string[] {
  const keys: string[] = [];

  keys.push(`post-${post.databaseId}`);
  keys.push(`post-${post.slug}`);
  keys.push('post-list');

  if (post.categories?.nodes) {
    post.categories.nodes.forEach((category) => {
      const numericId = extractNumericId(category.id);
      keys.push(`term-${numericId}`);
    });
  }

  if (post.tags?.nodes) {
    post.tags.nodes.forEach((tag) => {
      const numericId = extractNumericId(tag.id);
      keys.push(`term-${numericId}`);
    });
  }

  return [...new Set(keys)];
}

/**
 * Generate surrogate keys from a Page
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
// ============================================================================

async function fetchAllPostSlugs(): Promise<{ slugs: string[]; surrogateKeys: string[] }> {
  const query = `
    query AllPostSlugs {
      posts(first: 100, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(
    query,
    {},
    { tags: ['post-list'] }
  );

  const slugs = data.posts.nodes.map((node) => node.slug);
  return { slugs, surrogateKeys: ['post-list'] };
}

async function fetchAllPageSlugs(): Promise<{ slugs: string[]; surrogateKeys: string[] }> {
  const query = `
    query AllPageSlugs {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ pages: { nodes: { slug: string }[] } }>(
    query,
    {},
    { tags: ['page-list'] }
  );

  const slugs = data.pages.nodes.map((node) => node.slug);
  return { slugs, surrogateKeys: ['page-list'] };
}

async function fetchSinglePost(slug: string): Promise<{ post: Post | null; surrogateKeys: string[] }> {
  const query = `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        ...PostFields
      }
    }
    ${POST_FIELDS}
  `;

  const data = await fetchGraphQL<{ post: Post | null }>(
    query,
    { slug },
    { tags: [`post-${slug}`, 'post-list'] }
  );

  if (!data.post) {
    return { post: null, surrogateKeys: [`post-${slug}`] };
  }

  const surrogateKeys = generatePostSurrogateKeys(data.post);
  return { post: data.post, surrogateKeys };
}

async function fetchSinglePage(slug: string): Promise<{ page: Page | null; surrogateKeys: string[] }> {
  const query = `
    query PageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        ...PageFields
      }
    }
    ${PAGE_FIELDS}
  `;

  const data = await fetchGraphQL<{ page: Page | null }>(
    query,
    { slug },
    { tags: [`page-${slug}`, 'page-list'] }
  );

  if (!data.page) {
    return { page: null, surrogateKeys: [`page-${slug}`] };
  }

  const surrogateKeys = generatePageSurrogateKeys(data.page);
  return { page: data.page, surrogateKeys };
}

async function fetchRecentPostsData(
  first: number,
  after?: string
): Promise<{ posts: PostsConnection; surrogateKeys: string[] }> {
  const query = `
    query RecentPosts($first: Int!, $after: String) {
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

  const data = await fetchGraphQL<{ posts: PostsConnection }>(
    query,
    { first, after: after || null },
    { tags: ['post-list'] }
  );

  const allKeys = data.posts.nodes.flatMap((post) => generatePostSurrogateKeys(post));
  const uniqueKeys = [...new Set(allKeys)];

  return { posts: data.posts, surrogateKeys: uniqueKeys };
}

async function fetchPostsByCategoryData(
  categorySlug: string,
  first: number
): Promise<{ posts: Post[]; surrogateKeys: string[] }> {
  const query = `
    query PostsByCategory($categorySlug: String!, $first: Int!) {
      posts(first: $first, where: { categoryName: $categorySlug, status: PUBLISH }) {
        nodes {
          ...PostCardFields
        }
      }
    }
    ${POST_CARD_FIELDS}
  `;

  const data = await fetchGraphQL<{ posts: { nodes: Post[] } }>(
    query,
    { categorySlug, first },
    { tags: [`category-${categorySlug}`, 'post-list'] }
  );

  const allKeys = data.posts.nodes.flatMap((post) => generatePostSurrogateKeys(post));
  const uniqueKeys = [...new Set(allKeys)];

  return { posts: data.posts.nodes, surrogateKeys: uniqueKeys };
}

async function fetchFrontPageData(): Promise<{ page: Page | null; surrogateKeys: string[] }> {
  const query = `
    query FrontPage {
      nodeByUri(uri: "/") {
        ... on Page {
          ...PageFields
        }
      }
    }
    ${PAGE_FIELDS}
  `;

  const data = await fetchGraphQL<{ nodeByUri: Page | null }>(
    query,
    {},
    { tags: ['front-page', 'page-list'] }
  );

  const page = data.nodeByUri ?? null;

  if (!page) {
    return { page: null, surrogateKeys: ['front-page'] };
  }

  const surrogateKeys = [...generatePageSurrogateKeys(page), 'front-page'];
  return { page, surrogateKeys };
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
    query SiteSettings {
      generalSettings {
        title
        description
        url
        language
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{
      generalSettings: { title: string; description: string; url: string; language: string };
    }>(query, {}, { tags: ['settings'] });

    return {
      settings: data.generalSettings,
      surrogateKeys: ['settings'],
    };
  } catch (error) {
    console.warn('[fetchSiteSettings] Settings query failed:', error);
    return { settings: null, surrogateKeys: ['settings'] };
  }
}

// ============================================================================
// CACHED WRAPPER FUNCTIONS WITH 'use cache'
// ============================================================================

export async function getFrontPage(): Promise<Page | null> {
  'use cache';
  cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity });

  try {
    const { page, surrogateKeys } = await fetchFrontPageData();
    surrogateKeys.forEach((key) => cacheTag(key));
    return page;
  } catch (error) {
    console.warn('Unable to fetch front page:', error);
    return null;
  }
}

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

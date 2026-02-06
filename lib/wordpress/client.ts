import { GraphQLResponse } from './types';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || '';

if (!WORDPRESS_API_URL) {
  console.warn('WORDPRESS_API_URL is not set. WordPress data fetching will fail.');
}

export interface FetchOptions {
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
}

/**
 * Fetch data from WordPress GraphQL API with tag-based caching support
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: FetchOptions = {}
): Promise<GraphQLResponse<T>> {
  const { tags = [], revalidate = 3600 } = options;

  try {
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: {
        tags: tags,
        revalidate: revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(
        `GraphQL request failed: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
    }

    return json;
  } catch (error) {
    console.error('Error fetching from WordPress:', error);
    throw error;
  }
}

/**
 * Fetch data without caching (for dynamic/real-time data)
 */
export async function fetchGraphQLNoCache<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GraphQLResponse<T>> {
  return fetchGraphQL<T>(query, variables, {
    cache: 'no-store',
    revalidate: false,
  });
}

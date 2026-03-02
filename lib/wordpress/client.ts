/**
 * WordPress GraphQL Client
 * Simple fetch wrapper for WPGraphQL
 */

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || '';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface FetchOptions {
  tags?: string[];
}

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: FetchOptions = {}
): Promise<T> {
  if (!WORDPRESS_API_URL) {
    throw new Error('WORDPRESS_API_URL environment variable is not set');
  }

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  };

  if (options.tags && options.tags.length > 0) {
    fetchOptions.next = { tags: options.tags };
  }

  try {
    const response = await fetch(WORDPRESS_API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `GraphQL request failed: ${response.status} ${response.statusText}`
      );
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) {
      console.error('GraphQL errors:', JSON.stringify(json.errors));
    }

    if (!json.data) {
      throw new Error('No data returned from GraphQL');
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching from WordPress GraphQL:', error);
    throw error;
  }
}

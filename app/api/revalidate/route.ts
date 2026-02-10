import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand revalidation API endpoint
 *
 * This endpoint is called by WordPress webhooks to trigger cache revalidation
 * when content is updated.
 *
 * Usage:
 * POST /api/revalidate?secret=YOUR_SECRET
 * Body: { path?: string, tag?: string }
 *
 * Examples:
 * - Revalidate a specific path: { path: "/blog/my-post" }
 * - Revalidate by tag: { tag: "posts" }
 * - Revalidate both: { path: "/blog/my-post", tag: "posts" }
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Debug logging
  console.log('[Revalidate] Request received at:', new Date().toISOString());
  console.log('[Revalidate] Secret from query:', secret ? `${secret.substring(0,10)}... (length: ${secret.length})` : 'MISSING');
  console.log('[Revalidate] Expected secret defined:', !!process.env.WORDPRESS_REVALIDATE_SECRET);
  console.log('[Revalidate] Expected secret:', process.env.WORDPRESS_REVALIDATE_SECRET ? `${process.env.WORDPRESS_REVALIDATE_SECRET.substring(0,10)}... (length: ${process.env.WORDPRESS_REVALIDATE_SECRET.length})` : 'UNDEFINED');
  console.log('[Revalidate] Secrets match:', secret === process.env.WORDPRESS_REVALIDATE_SECRET);

  // Verify secret token
  if (secret !== process.env.WORDPRESS_REVALIDATE_SECRET) {
    console.log('[Revalidate] 401 - Secret mismatch or undefined');
    return NextResponse.json(
      { message: 'Invalid secret token' },
      { status: 401 }
    );
  }

  // Validate origin header (optional security enhancement)
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (origin && process.env.WORDPRESS_API_URL) {
    const allowedOrigin = process.env.WORDPRESS_API_URL.replace('/graphql', '');
    if (!origin.startsWith(allowedOrigin)) {
      console.warn(`[Revalidate] Rejected request from unauthorized origin: ${origin}`);
    }
  }

  // Handle both JSON and form-encoded bodies
  let body: { path?: string; tag?: string; invalidation?: { tags?: string[]; paths?: string[] } } = {};

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // WordPress plugin sends form-encoded data, which we don't need
      // Path comes from query params, so just use empty body
      body = {};
    }
  } catch (error) {
    // If body parsing fails, continue with empty body (path is in query params anyway)
    console.log('[Revalidate] Body parsing failed (expected for form-encoded), continuing with query params');
    body = {};
  }

  try {
    const { path, tag, invalidation } = body;

    // Check query params for path (compatibility with existing WordPress plugin)
    const pathFromQuery = request.nextUrl.searchParams.get('path');

    // New format: invalidation object with arrays
    if (invalidation) {
      const { tags, paths } = invalidation;

      if (!tags?.length && !paths?.length) {
        return NextResponse.json(
          { message: 'Missing tags or paths in invalidation object' },
          { status: 400 }
        );
      }

      const results: { tags: string[]; paths: string[] } = { tags: [], paths: [] };

      // Process tag array
      if (tags && Array.isArray(tags)) {
        for (const t of tags) {
          await revalidateTag(t);
          results.tags.push(t);
          console.log(`[Revalidate] Tag revalidated: ${t}`);
        }
      }

      // Process path array
      if (paths && Array.isArray(paths)) {
        for (const p of paths) {
          await revalidatePath(p);
          results.paths.push(p);
          console.log(`[Revalidate] Path revalidated: ${p}`);
        }
      }

      console.log(`[Revalidate] Webhook received at ${new Date().toISOString()}`);

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
        results,
      });
    }

    // Legacy format: single path or tag (backward compatibility)
    // Support path from both body and query params (existing WP plugin sends via query)
    const pathToRevalidate = path || pathFromQuery;

    if (pathToRevalidate) {
      await revalidatePath(pathToRevalidate);
      console.log(`[Revalidate] Path revalidated: ${pathToRevalidate}`);
    }

    if (tag) {
      await revalidateTag(tag);
      console.log(`[Revalidate] Tag revalidated: ${tag}`);
    }

    if (!pathToRevalidate && !tag) {
      return NextResponse.json(
        { message: 'Missing path or tag parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: pathToRevalidate || null,
      tag: tag || null,
    });
  } catch (err) {
    console.error('[Revalidate] Error:', err);
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET method for testing the endpoint
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.WORDPRESS_REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret token' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'Revalidation endpoint is working',
    usage: 'Send POST request with { path: "/path" } or { tag: "tag-name" } in body',
  });
}

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

  // Verify secret token
  if (secret !== process.env.WORDPRESS_REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { path, tag } = body;

    // Revalidate by path
    if (path) {
      await revalidatePath(path);
      console.log(`[Revalidate] Path revalidated: ${path}`);
    }

    // Revalidate by tag
    if (tag) {
      await revalidateTag(tag);
      console.log(`[Revalidate] Tag revalidated: ${tag}`);
    }

    // If neither path nor tag provided, return error
    if (!path && !tag) {
      return NextResponse.json(
        { message: 'Missing path or tag parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path || null,
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

# WordPress Headless with Next.js 16

A headless WordPress application built with Next.js 16, WPGraphQL, and optimized for Pantheon hosting.

## Features

- **Next.js 16** with App Router, `use cache` directive, and Partial Prerendering
- **WPGraphQL** for structured data fetching
- **Surrogate Key Cache Invalidation** via `@pantheon-systems/nextjs-cache-handler`
- **On-Demand Revalidation** via WordPress webhooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Optimized for Pantheon** hosting platform

## Architecture

### Next.js Application

```
/app
  /api/revalidate     - On-demand revalidation endpoint
  /blog               - Blog listing and individual posts
  /[...slug]          - Catch-all for WordPress pages

/components
  /wordpress          - WordPress-specific components (PostCard, FeaturedImage, PageContent)

/lib/wordpress
  /client.ts          - GraphQL client with cache tag support
  /queries.ts         - Cached data queries using 'use cache' directive
  /types.ts           - TypeScript types
  /fragments.ts       - Reusable GraphQL fragments
```

## Prerequisites

- Node.js 20+ (specified in `package.json` engines field)
- WordPress backend with WPGraphQL plugin installed and active
- Pantheon account for deployment

## Local Development Setup

### 1. Clone and Install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```bash
WORDPRESS_API_URL=https://your-wp-site.pantheonsite.io/graphql
WORDPRESS_REVALIDATE_SECRET=your-secure-random-string
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## WordPress Backend Setup

### Required WordPress Plugins

1. **WPGraphQL** - Core GraphQL API
2. **WPGraphQL CORS** - Cross-origin request handling (if needed)
3. **Headless Mode** - Disable WP front-end (recommended)

## Pantheon Deployment

### Environment Variables Setup

Use Terminus Secrets Manager to configure environment variables:

```bash
# Install Secrets Manager plugin
terminus self:plugin:install terminus-secrets-manager-plugin

# Set site-wide variables
terminus secret:site:set <site-name> WORDPRESS_REVALIDATE_SECRET "your-secret"

# Set environment-specific WordPress URLs
terminus secret:env:set <site-name>.dev WORDPRESS_API_URL "https://dev-wp.pantheonsite.io/graphql"
terminus secret:env:set <site-name>.test WORDPRESS_API_URL "https://test-wp.pantheonsite.io/graphql"
terminus secret:env:set <site-name>.live WORDPRESS_API_URL "https://live-wp.pantheonsite.io/graphql"
```

### Automatic Variables

These are automatically set by Pantheon:
- `CACHE_BUCKET` - GCS bucket for cache storage
- `OUTBOUND_PROXY_ENDPOINT` - Edge cache proxy

### Build Process

Pantheon automatically:
1. Detects Node.js version from `package.json` engines field
2. Runs `npm ci --quiet --no-fund --no-audit`
3. Runs `npm run build` (includes copying static assets to standalone output)
4. Deploys to containers behind Global CDN

**Important:** Ensure only ONE lock file exists (`package-lock.json` recommended)

## Cache Strategy

### Cache Handler

This project uses `@pantheon-systems/nextjs-cache-handler` which provides:

- **Dual Cache Support**: GCS in production, file-based locally
- **Tag-Based Invalidation**: O(1) cache clearing by surrogate key
- **Build-Aware Caching**: Auto-invalidates on new builds

### Cache Configuration

- **Next.js `use cache`**: All query functions use `cacheLife({ stale: Infinity, revalidate: Infinity, expire: Infinity })` — content is cached indefinitely and only invalidated via surrogate key purging
- **CDN (`s-maxage`)**: 7-day TTL with 24-hour `stale-while-revalidate`, configured in `next.config.mjs`
- **Surrogate Keys**: Each post, page, and taxonomy term gets tagged keys (e.g., `post-123`, `term-5`, `post-list`) for targeted purging

### On-Demand Revalidation

WordPress triggers revalidation via webhook when content is updated:

```bash
# Surrogate key format (preferred)
curl -X POST https://your-nextjs-site.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_SECRET", "surrogate_keys": ["post-123", "post-my-post", "post-list"]}'

# Single path/tag format
curl -X POST https://your-nextjs-site.com/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"path": "/blog/my-post", "tag": "post-list"}'
```

## Key Files

- `next.config.mjs` - Next.js configuration with cache handlers, image optimization, and CDN headers
- `cache-handler.mjs` - Legacy ISR cache handler (routes, fetch cache)
- `use-cache-handler.mjs` - Next.js 16 `use cache` directive handler
- `app/layout.tsx` - Root layout with site-wide navigation
- `lib/wordpress/client.ts` - GraphQL client with cache tag support
- `lib/wordpress/queries.ts` - All WordPress data queries with `use cache`

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production (includes static asset copy)
npm run start    # Start production server (standalone)
npm run lint     # Run ESLint
```

## Debugging

### Cache Debugging

Enable cache handler debug logging:

```bash
CACHE_DEBUG=true npm run dev
```

### Fetch Debugging

Fetch URL logging is enabled in `next.config.mjs`:

```javascript
logging: {
  fetches: {
    fullUrl: true,
  },
}
```

## Pantheon-Specific Notes

### Best Practices

- Use only npm (single lock file)
- Set Node.js version in `package.json` engines
- Configure images with WordPress remote patterns
- Use surrogate key-based revalidation for cache efficiency
- Set long CDN TTLs and rely on active purging for freshness

## Support

For Pantheon Next.js documentation:
- [Next.js Overview](https://docs.pantheon.io/nextjs)
- [Limitations and Considerations](https://docs.pantheon.io/nextjs/considerations)

## License

MIT

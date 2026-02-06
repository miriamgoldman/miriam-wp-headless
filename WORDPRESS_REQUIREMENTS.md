# WordPress Backend Requirements

## Plugin Installation

### Required Plugins

1. **WPGraphQL** (Core)
   - Primary GraphQL API for WordPress
   - Install from WordPress.org or via Composer
   - Version: Latest stable (5.x+)

2. **WPGraphQL CORS**
   - Handles cross-origin requests from Next.js frontend
   - Configure allowed origins for Pantheon environments

3. **WPGraphQL for Advanced Custom Fields (ACF)**
   - Future-proofing for custom field support
   - Only required if/when ACF is added
   - Automatically exposes ACF fields to GraphQL schema

### Recommended Plugins

4. **Headless Mode**
   - Disables WordPress front-end
   - Redirects all front-end requests to Next.js URL
   - Prevents duplicate content issues

5. **WP Webhooks** or Custom Implementation
   - Triggers Next.js revalidation when content changes
   - See "Revalidation Webhook" section below

## Plugin Configuration

### WPGraphQL Settings

Navigate to **GraphQL > Settings** in WordPress admin:

- **GraphQL Endpoint**: `/graphql` (default)
- **Enable GraphQL Introspection**: Yes (development), No (production - optional security)
- **Query Depth**: 15 (default, adjust if needed)
- **Query Complexity**: Disabled or set limit based on needs

### WPGraphQL CORS Configuration

Navigate to **GraphQL > Settings > CORS**:

Add your Next.js environment URLs to allowed origins:
```
https://dev-your-nextjs-site.pantheonsite.io
https://test-your-nextjs-site.pantheonsite.io
https://live-your-nextjs-site.pantheonsite.io
http://localhost:3000
```

- **Allow Credentials**: Yes
- **Allowed Methods**: GET, POST
- **Allowed Headers**: Content-Type, Authorization

### Headless Mode Configuration

Navigate to **Settings > Headless Mode**:

- **Front-End URL**: Set to your production Next.js URL
  - Dev: `https://dev-your-nextjs-site.pantheonsite.io`
  - Test: `https://test-your-nextjs-site.pantheonsite.io`
  - Live: `https://live-your-nextjs-site.pantheonsite.io`

- **Redirect Mode**: 301 Permanent Redirect
- **Preview Mode**: Enable if using Next.js preview functionality

## Code Customizations

### Revalidation Webhook Setup

Add to `functions.php` or create a custom plugin:

```php
<?php
/**
 * Trigger Next.js revalidation on post save
 */
add_action('save_post', 'trigger_nextjs_revalidation', 10, 3);

function trigger_nextjs_revalidation($post_id, $post, $update) {
    // Skip autosaves and revisions
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }

    // Only trigger for published posts/pages
    if ($post->post_status !== 'publish') {
        return;
    }

    // Get Next.js revalidation endpoint from environment
    $nextjs_url = getenv('NEXTJS_REVALIDATE_URL');
    $secret = getenv('NEXTJS_REVALIDATE_SECRET');

    if (!$nextjs_url || !$secret) {
        error_log('Next.js revalidation not configured');
        return;
    }

    // Build revalidation URL
    $revalidate_url = trailingslashit($nextjs_url) . 'api/revalidate';

    // Prepare data
    $data = [
        'secret' => $secret,
        'path' => '/' . $post->post_name, // Adjust based on your routing
        'tag' => $post->post_type, // For tag-based revalidation
    ];

    // Send async request
    wp_remote_post($revalidate_url, [
        'blocking' => false,
        'body' => $data,
        'timeout' => 1,
    ]);
}
```

### GraphQL Performance Optimization

Add to `functions.php`:

```php
<?php
/**
 * Enable object caching for GraphQL queries
 * Pantheon provides Redis object cache
 */
add_filter('graphql_use_cache', '__return_true');

/**
 * Set cache TTL for GraphQL queries (1 hour)
 */
add_filter('graphql_cache_ttl', function() {
    return 3600;
});
```

## Environment Variables (Pantheon)

Set via Pantheon Dashboard or Terminus CLI:

```bash
# Next.js revalidation endpoint
terminus env:set <site>.live NEXTJS_REVALIDATE_URL "https://live-your-nextjs-site.pantheonsite.io"

# Revalidation secret (must match Next.js env var)
terminus env:set <site>.live NEXTJS_REVALIDATE_SECRET "your-secure-random-string"

# Set for each environment (dev, test, live)
```

Or add to `wp-config.php` for environment-specific settings:

```php
<?php
// Pantheon environment-specific configuration
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
    switch ($_ENV['PANTHEON_ENVIRONMENT']) {
        case 'live':
            define('NEXTJS_REVALIDATE_URL', 'https://live-your-nextjs-site.pantheonsite.io');
            break;
        case 'test':
            define('NEXTJS_REVALIDATE_URL', 'https://test-your-nextjs-site.pantheonsite.io');
            break;
        case 'dev':
            define('NEXTJS_REVALIDATE_URL', 'https://dev-your-nextjs-site.pantheonsite.io');
            break;
    }

    define('NEXTJS_REVALIDATE_SECRET', getenv('NEXTJS_REVALIDATE_SECRET'));
}
```

## GraphQL Schema Verification

After plugin installation, verify GraphQL endpoint:

```bash
# Test GraphQL endpoint
curl -X POST https://your-wp-site.pantheonsite.io/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title url } }"}'
```

Expected response:
```json
{
  "data": {
    "generalSettings": {
      "title": "Your Site Title",
      "url": "https://your-wp-site.pantheonsite.io"
    }
  }
}
```

## Security Considerations

### Production Hardening

1. **Disable GraphQL IDE in production**:
```php
add_filter('graphql_show_ide', function() {
    return !in_array(getenv('PANTHEON_ENVIRONMENT'), ['test', 'live']);
});
```

2. **Rate limiting** (if needed):
   - Use Pantheon's Advanced Global CDN rate limiting
   - Or implement application-level rate limiting

3. **Query complexity limits**:
   - Set in WPGraphQL settings to prevent resource exhaustion
   - Recommended: Max query depth 15, complexity disabled initially

## Pantheon-Specific Notes

- **Object Cache**: Pantheon provides Redis object cache - ensure it's enabled for GraphQL query caching
- **Multidev Environments**: Configure separate CORS origins for each multidev
- **File Uploads**: WordPress media uploads work normally, Next.js will use remote image optimization

## Deployment Checklist

- [ ] Install WPGraphQL plugin
- [ ] Install WPGraphQL CORS plugin
- [ ] Configure CORS allowed origins
- [ ] Install WPGraphQL for ACF (if using ACF)
- [ ] Install Headless Mode plugin
- [ ] Configure front-end URL in Headless Mode
- [ ] Add revalidation webhook code to functions.php
- [ ] Set environment variables for revalidation
- [ ] Test GraphQL endpoint
- [ ] Verify CORS headers
- [ ] Enable Redis object cache (Pantheon)
- [ ] Production hardening (disable IDE, set query limits)

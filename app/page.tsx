import Link from 'next/link';
import { getRecentPosts } from '@/lib/wordpress/queries';

export default async function Home() {
  const { nodes: posts } = await getRecentPosts(3);

  return (
    <div>
      <h1>Welcome to WordPress Headless</h1>
      <p>A Next.js 16 site powered by WordPress</p>
      <Link href="/blog">View Blog</Link>

      <h2>Recent Posts</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>
                <h3>{post.title}</h3>
              </Link>
              {post.excerpt && <p>{post.excerpt.replace(/<[^>]*>/g, '').slice(0, 150)}...</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
}

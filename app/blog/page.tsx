import { Metadata } from 'next';
import Link from 'next/link';
import { getRecentPosts } from '@/lib/wordpress/queries';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
};

export default async function BlogPage() {
  const { nodes: posts, pageInfo } = await getRecentPosts(12);

  return (
    <div>
      <h1>Blog</h1>
      <p>Latest articles and updates</p>

      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>Published: {new Date(post.date).toLocaleDateString()}</p>
              {post.excerpt && <p>{post.excerpt.replace(/<[^>]*>/g, '').slice(0, 200)}...</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}

      {pageInfo.hasNextPage && <p>More posts available (pagination coming soon)</p>}
    </div>
  );
}

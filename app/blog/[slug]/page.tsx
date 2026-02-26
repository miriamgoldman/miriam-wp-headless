import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPostSlugs, getPostBySlug } from '@/lib/wordpress/queries';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();

    // Next.js 16 Cache Components requires at least one entry
    if (slugs.length === 0) {
      return [{ slug: 'placeholder' }];
    }

    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.warn('[generateStaticParams] WordPress unavailable, using placeholder');
    return [{ slug: 'placeholder' }];
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const excerpt = post.excerpt?.replace(/<[^>]*>/g, '') || '';

  return {
    title: post.title,
    description: excerpt.slice(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Published: {new Date(post.date).toLocaleDateString()}</p>
      <p>Last updated: {new Date(post.modified).toLocaleDateString()}</p>

      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <Link href="/blog">← Back to blog</Link>
    </article>
  );
}

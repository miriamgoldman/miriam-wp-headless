import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPageSlugs, getPageBySlug } from '@/lib/wordpress/queries';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPageSlugs();

    // Next.js 16 Cache Components requires at least one entry
    if (slugs.length === 0) {
      return [{ slug: ['placeholder'] }];
    }

    return slugs.map((slug) => ({
      slug: [slug],
    }));
  } catch (error) {
    console.warn('[generateStaticParams] WordPress unavailable, using placeholder');
    return [{ slug: ['placeholder'] }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join('/');
  const page = await getPageBySlug(pageSlug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.content.replace(/<[^>]*>/g, '').slice(0, 160),
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug.join('/');
  const page = await getPageBySlug(pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <article>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}

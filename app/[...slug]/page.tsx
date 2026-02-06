import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPageSlugs, getPageBySlug } from '@/lib/wordpress/queries';
import PageContent from '@/components/wordpress/PageContent';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const revalidate = 7200; // Revalidate every 2 hours

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();

  return slugs.map((slug) => ({
    slug: [slug],
  }));
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
    openGraph: {
      title: page.title,
      type: 'website',
      images: page.featuredImage
        ? [
            {
              url: page.featuredImage.node.sourceUrl,
              alt: page.featuredImage.node.altText || page.title,
            },
          ]
        : [],
    },
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
    <div className="bg-white">
      <PageContent content={page} showMeta={false} />
    </div>
  );
}

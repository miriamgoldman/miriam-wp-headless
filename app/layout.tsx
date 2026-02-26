import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/wordpress/queries';
import './globals.css';

const CURRENT_YEAR = 2026;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();

    return {
      title: {
        default: settings?.title || 'WordPress Headless',
        template: `%s | ${settings?.title || 'WordPress Headless'}`,
      },
      description: settings?.description || 'A headless WordPress site built with Next.js',
    };
  } catch (error) {
    console.warn('[Layout] WordPress unavailable during build, using fallback metadata');
    return {
      title: {
        default: 'WordPress Headless',
        template: '%s | WordPress Headless',
      },
      description: 'A headless WordPress site built with Next.js',
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.warn('[Layout] WordPress unavailable during build, using fallback settings');
    settings = null;
  }

  return (
    <html lang={settings?.language || 'en'}>
      <body>
        <header>
          <Link href="/">
            <h1>{settings?.title || 'WordPress Headless'}</h1>
          </Link>
          <nav>
            <Link href="/">Home</Link>
            {' | '}
            <Link href="/blog">Blog</Link>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <p>© {CURRENT_YEAR} {settings?.title || 'WordPress Headless'}. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

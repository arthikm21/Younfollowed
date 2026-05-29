import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://younfollowed.app'),
  title: "YOUnfollowed — See who doesn't follow you back",
  description:
    'Privately analyze your Instagram followers in your browser. Upload your data export and instantly see who doesn\'t follow you back, your mutuals, and recent unfollows. Nothing is ever uploaded.',
  keywords: [
    'instagram',
    'followers',
    'unfollowers',
    'who unfollowed me',
    'instagram analyzer',
    "doesn't follow back",
    'instagram data export',
    'follower tracker',
  ],
  applicationName: 'YOUnfollowed',
  authors: [{ name: 'YOUnfollowed' }],
  openGraph: {
    title: "YOUnfollowed — See who doesn't follow you back",
    description:
      'Privately analyze your Instagram followers in your browser. See who doesn\'t follow you back — nothing is ever uploaded.',
    type: 'website',
    siteName: 'YOUnfollowed',
    url: 'https://younfollowed.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: "YOUnfollowed — See who doesn't follow you back",
    description:
      'Privately analyze your Instagram followers in your browser. Nothing is ever uploaded.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YOUnfollowed',
  },
};

export const viewport: Viewport = {
  themeColor: '#0071e3',
  width: 'device-width',
  initialScale: 1,
  // Cap zoom slightly to avoid iOS input-focus zoom jank, but stay accessible.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

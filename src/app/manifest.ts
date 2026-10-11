import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: SITE.language,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Navy matches the header, so the splash screen and system bars blend into the app
    background_color: SITE.colors.navy,
    theme_color: SITE.colors.navy,
    categories: ['productivity', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

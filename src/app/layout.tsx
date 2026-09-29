import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MWPHGLDC & GTGC | Prince Hall Masonic Temple (PHFAMOESCEF) Jurisdictional Calendar',
  description:
    'Official unified jurisdictional calendar for the Most Worshipful Prince Hall Grand Lodge of DC, Georgiana Thomas Grand Chapter O.E.S., and the Prince Hall Masonic Temple / PHFAMOESCEF at 1000 U Street NW, Washington, D.C.',
  keywords: [
    'Prince Hall',
    'MWPHGLDC',
    'Georgiana Thomas Grand Chapter',
    'OES',
    'PHFAMOESCEF',
    '1000 U Street NW',
    'Masonic Temple Washington DC',
    'Masonic Calendar',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F9FA] dark:bg-[#07192F] text-[#1A1D20] dark:text-[#F8F9FA] font-body selection:bg-[#D4AF37] selection:text-[#0B2545]">
        {children}
      </body>
    </html>
  );
}

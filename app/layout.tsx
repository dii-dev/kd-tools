import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { RootClientWrapper } from '@/components/root-client-wrapper'
import './globals.css'

const kantumruyPro = localFont({
  src: [
    {
      path: '../../public/fonts/KantumruyPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/KantumruyPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-khmer',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: 'KD OCR - Document Converter & QR Code Generator',
  description: 'Convert documents between formats instantly with KD OCR. Support for Word to PDF, PDF to Word, Image to Word, Image to PDF, and QR code generation with custom logos. Fast, accurate OCR technology for Khmer and English documents.',
  keywords: ['OCR', 'document converter', 'PDF converter', 'Word converter', 'image to PDF', 'QR code generator', 'Khmer OCR', 'document conversion'],
  authors: [{ name: 'KD OCR' }],
  creator: 'KD OCR',
  publisher: 'KD OCR',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kdocr.com',
    languages: {
      en: 'https://kdocr.com/en',
      'km': 'https://kdocr.com/km',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kdocr.com',
    siteName: 'KD OCR',
    title: 'KD OCR - Document Converter & QR Code Generator',
    description: 'Convert documents and generate custom QR codes instantly with advanced OCR technology',
    images: [
      {
        url: 'https://kdocr.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KD OCR - Document Conversion Tool',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KD OCR - Document Converter & QR Code Generator',
    description: 'Convert documents between formats instantly with KD OCR',
    creator: '@KDOCR',
    images: ['https://kdocr.com/twitter-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        sizes: '32x32',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        sizes: '32x32',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${kantumruyPro.variable}`}>
      <body className="font-sans antialiased">
        <RootClientWrapper>
          {children}
        </RootClientWrapper>
      </body>
    </html>
  )
}

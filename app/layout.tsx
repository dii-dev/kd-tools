import type { Metadata, Viewport } from 'next'
import { Kantumruy_Pro, Poppins } from 'next/font/google'
import { RootClientWrapper } from '@/components/root-client-wrapper'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

const kantumruyPro = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  weight: ['400', '700'],
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
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'KD Tools | OCR, JSON Tools, QR Code Generator',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'KD Tools is a Khmer-first online toolkit for OCR document conversion, QR code generation and decoding, JSON pretty formatting, JSON minify, JSON diff compare, XML to JSON conversion, and SOAP to JSON conversion.',
  keywords: [
    'KD Tools',
    'Khmer tools',
    'OCR tools',
    'document converter',
    'Word to PDF',
    'PDF to Word',
    'Image to Word',
    'Image to PDF',
    'JSON formatter',
    'JSON minify',
    'JSON diff',
    'JSON pretty',
    'JSON string formatter',
    'XML to JSON',
    'SOAP to JSON',
    'QR code generator',
    'QR code decoder',
    'online converter',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'km_KH',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'KD Tools | OCR, JSON Tools, QR Code Generator',
    description:
      'Khmer-first OCR document converters, JSON tools, XML and SOAP converters, and QR code generator and decoder for fast online workflows.',
    images: [
      {
        url: '/icon.svg',
        alt: `${SITE_NAME} logo`,
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KD Tools | OCR, JSON Tools, QR Code Generator',
    description: 'Online OCR converters, JSON tools, XML and SOAP converters, and QR code generator and decoder for Khmer and English workflows.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/icon.svg',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="km" suppressHydrationWarning className={`${poppins.variable} ${kantumruyPro.variable}`}>
      <body className="font-sans antialiased">
        <RootClientWrapper>
          {children}
        </RootClientWrapper>
      </body>
    </html>
  )
}

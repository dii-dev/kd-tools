import type { Metadata } from 'next'
import { PageWrapper } from "@/components/page-wrapper"
import { createPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'OCR Converter, JSON Tools, and QR Code Generator',
  description:
    'Use KD Tools to convert Word to PDF, PDF to Word, images to Word or PDF, format and compare JSON, convert XML or SOAP to JSON, and generate or decode QR codes online.',
  path: '/',
  keywords: [
    'Khmer OCR',
    'Word to PDF',
    'PDF to Word',
    'Image to Word',
    'Image to PDF',
    'JSON tools',
    'JSON diff',
    'JSON formatter',
    'XML to JSON',
    'SOAP to JSON',
    'QR code generator',
    'QR code decoder',
  ],
})

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description:
          'Khmer-first OCR converters, JSON tools, XML and SOAP converters, and QR code generator and decoder.',
        inLanguage: ['en', 'km'],
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/tools`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'KD Tools Features',
        itemListElement: [
          'Word to PDF converter',
          'PDF to Word converter',
          'Image to Word OCR',
          'Image to PDF converter',
          'JSON Pretty formatter',
          'JSON Format and Minify tool',
          'JSON Diff compare tool',
          'JSON Pretty String formatter',
          'XML to JSON converter',
          'SOAP to JSON converter',
          'QR code generator',
          'QR code decoder',
        ].map((name, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageWrapper />
    </>
  )
}

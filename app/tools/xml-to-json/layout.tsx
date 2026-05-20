import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'XML to JSON Converter',
  description:
    'Convert XML into readable JSON online. Paste XML and instantly transform it into structured JSON output.',
  path: '/tools/xml-to-json',
  keywords: ['XML to JSON', 'XML converter', 'convert XML to JSON online'],
})

export default function XmlToJsonLayout({ children }: { children: React.ReactNode }) {
  return children
}

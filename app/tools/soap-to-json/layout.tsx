import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'SOAP to JSON Converter',
  description:
    'Convert SOAP XML responses into JSON online for easier debugging, integration work, and API inspection.',
  path: '/tools/soap-to-json',
  keywords: ['SOAP to JSON', 'SOAP XML converter', 'convert SOAP response to JSON'],
})

export default function SoapToJsonLayout({ children }: { children: React.ReactNode }) {
  return children
}

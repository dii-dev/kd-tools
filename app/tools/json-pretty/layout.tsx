import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'JSON Pretty Formatter',
  description:
    'Beautify and format JSON online with readable indentation. Paste raw JSON and get clean formatted output instantly.',
  path: '/tools/json-pretty',
  keywords: ['JSON pretty', 'JSON beautifier', 'JSON formatter online', 'format JSON'],
})

export default function JsonPrettyLayout({ children }: { children: React.ReactNode }) {
  return children
}

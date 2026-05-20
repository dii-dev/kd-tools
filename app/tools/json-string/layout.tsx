import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'JSON Pretty String Formatter',
  description:
    'Convert escaped JSON strings into readable formatted JSON. Useful for logs, API payloads, and nested JSON debugging.',
  path: '/tools/json-string',
  keywords: ['JSON string formatter', 'escaped JSON formatter', 'prettify JSON string'],
})

export default function JsonStringLayout({ children }: { children: React.ReactNode }) {
  return children
}

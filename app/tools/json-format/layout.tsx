import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'JSON Format and Minify Tool',
  description:
    'Format JSON with custom indentation or minify JSON for compact output. Fast online JSON formatting utility.',
  path: '/tools/json-format',
  keywords: ['JSON format', 'JSON minify', 'minify JSON', 'format JSON online'],
})

export default function JsonFormatLayout({ children }: { children: React.ReactNode }) {
  return children
}

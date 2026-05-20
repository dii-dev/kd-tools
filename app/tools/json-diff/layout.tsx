import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'JSON Diff Compare Tool',
  description:
    'Compare two JSON documents side by side, inspect changed rows, and export the diff output online.',
  path: '/tools/json-diff',
  keywords: ['JSON diff', 'compare JSON', 'side by side JSON diff', 'JSON compare tool'],
})

export default function JsonDiffLayout({ children }: { children: React.ReactNode }) {
  return children
}

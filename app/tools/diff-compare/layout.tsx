import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Diff Compare Tool',
  description:
    'Compare text, files, and folders side by side, inspect changed rows, and export the diff output online.',
  path: '/tools/diff-compare',
  keywords: ['diff compare', 'file compare', 'folder compare', 'side by side diff tool'],
})

export default function DiffCompareLayout({ children }: { children: React.ReactNode }) {
  return children
}

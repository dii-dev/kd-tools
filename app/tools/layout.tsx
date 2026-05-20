import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'JSON, XML, SOAP, OCR, and QR Tools',
  description:
    'Browse KD Tools utilities for JSON pretty formatting, JSON minify, JSON diff, JSON string cleanup, XML to JSON, SOAP to JSON, OCR document conversion, and QR tools.',
  path: '/tools',
  keywords: ['JSON tools', 'JSON minify', 'JSON diff', 'XML to JSON', 'SOAP to JSON', 'OCR tools', 'QR tools', 'online developer tools'],
})

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

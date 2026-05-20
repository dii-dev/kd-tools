import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { QrPageClient } from './qr-page-client'

export const metadata: Metadata = createPageMetadata({
  title: 'QR Code Generator and Decoder',
  description:
    'Generate QR codes from text or links, customize colors, frames, and logos, or decode QR images back into readable text online.',
  path: '/qr',
  keywords: ['QR code generator', 'QR code decoder', 'QR tools', 'generate QR online', 'decode QR image', 'custom QR code', 'QR with logo'],
})

export default function QrPage() {
  return <QrPageClient />
}

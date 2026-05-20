'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { QRGenerator } from '@/components/qr-generator'

export function QrPageClient() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <QRGenerator isOpen onClose={() => {}} embedded />
        </div>
      </div>
      <Footer />
    </main>
  )
}

'use client'

import { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/language-context'
import { Analytics } from '@vercel/analytics/next'

export function RootClientWrapper({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Analytics />
    </LanguageProvider>
  )
}

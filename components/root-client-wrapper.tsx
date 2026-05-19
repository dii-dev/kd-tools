'use client'

import { ReactNode } from 'react'
import { LanguageProvider } from '@/lib/language-context'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'

export function RootClientWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        {children}
        <Analytics />
      </LanguageProvider>
    </ThemeProvider>
  )
}

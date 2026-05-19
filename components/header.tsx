'use client'

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"
import { BrandLogo } from "./brand-logo"

export function Header() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/78 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/58 dark:border-white/8 dark:bg-black/28 dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-3 py-3">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <BrandLogo />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-lg font-bold text-foreground">KD Tools</span>
                <span className="hidden rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary md:inline-flex">
                  OCR
                </span>
              </div>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">{t('header.brand-tag')}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "./language-switcher"

export function Header() {
  const { t } = useLanguage()
  return (
    <header className="border-b border-border bg-gradient-to-r from-background via-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-md group-hover:shadow-lg transition-all">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-lg font-bold text-foreground">KD OCR</span>
              <span className="text-xs text-muted-foreground font-medium">ខ្មែរ</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {t('header.features')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all" />
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {t('header.how-it-works')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all" />
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {t('header.pricing')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all" />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" className="hidden sm:inline-flex text-sm hover:text-primary">
              {t('header.login')}
            </Button>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all">{t('header.try')}</Button>
          </div>
        </div>
      </div>
    </header>
  )
}

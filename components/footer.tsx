"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { BrandLogo } from "@/components/brand-logo"

export function Footer() {
  const { language, t } = useLanguage()
  const ocrFeatures = [
    { href: "/", label: t('features.word-to-pdf') },
    { href: "/", label: t('features.pdf-to-word') },
    { href: "/", label: t('features.image-to-word') },
    { href: "/", label: t('features.image-to-pdf') },
  ]
  const jsonFeatures = [
    { href: "/tools/json-pretty", label: t('json.pretty.title') },
    { href: "/tools/json-format", label: t('json.format.title') },
    { href: "/tools/diff-compare", label: t('json.diff.title') },
    { href: "/tools/json-string", label: t('json.string.title') },
  ]
  const quickLinks = [
    { href: "/qr", label: t('features.qr-tools') },
    { href: "/tools", label: t('tools.title') },
    { href: "/#features", label: t('features.ocr-title') },
    { href: "/#how-it-works", label: t('how.title') },
  ]

  return (
    <footer className="border-t border-border py-12 md:py-16 dark:border-white/8 dark:bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.025))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 dark:rounded-2xl dark:border dark:border-white/8 dark:bg-white/[0.03] dark:p-5">
            <Link href="/" className="group mb-4 flex min-w-0 items-center gap-3">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <BrandLogo />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      'block text-sm font-bold leading-tight text-foreground sm:text-lg',
                      language === 'km' ? 'font-[family-name:var(--font-khmer)] sm:text-base' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {t('header.brand-name')}
                  </span>
                  <span className="hidden rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary md:inline-flex">
                    OCR
                  </span>
                </div>
                <span
                  className={[
                    'block text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs',
                    language === 'km' ? 'font-[family-name:var(--font-khmer)]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {t('header.brand-tag')}
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('features.ocr-title')}</h3>
            <ul className="space-y-3 text-sm">
              {ocrFeatures.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('features.converter-title')}</h3>
            <ul className="space-y-3 text-sm">
              {jsonFeatures.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('features.qr-tools')}</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground dark:border-white/8">
          <p>&copy; {new Date().getFullYear()} KD Tools. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

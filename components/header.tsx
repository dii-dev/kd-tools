'use client'

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { JSON_TOOLS, OCR_TOOLS } from "@/constants"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"
import { BrandLogo } from "./brand-logo"

function getJsonToolTranslation(toolHref: string, t: (key: any) => string) {
  return {
    title:
      toolHref === '/tools/json-pretty'
        ? t('json.pretty.title')
        : toolHref === '/tools/json-string'
          ? t('json.string.title')
          : toolHref === '/tools/diff-compare'
            ? t('json.diff.title')
            : toolHref === '/tools/xml-to-json'
              ? t('xml.json.title')
              : toolHref === '/tools/soap-to-json'
                ? t('soap.json.title')
                : t('json.format.title'),
    description:
      toolHref === '/tools/json-pretty'
        ? t('json.pretty.subtitle')
        : toolHref === '/tools/json-string'
          ? t('json.string.subtitle')
          : toolHref === '/tools/diff-compare'
            ? t('json.diff.subtitle')
            : toolHref === '/tools/xml-to-json'
              ? t('xml.json.subtitle')
              : toolHref === '/tools/soap-to-json'
                ? t('soap.json.subtitle')
                : t('json.format.subtitle'),
  }
}

function getOcrToolTranslation(toolTitle: string, t: (key: any) => string) {
  return {
    title:
      toolTitle === 'Word to PDF'
        ? t('features.word-to-pdf')
        : toolTitle === 'PDF to Word'
          ? t('features.pdf-to-word')
          : toolTitle === 'Image to Word'
            ? t('features.image-to-word')
            : toolTitle === 'Image to PDF'
              ? t('features.image-to-pdf')
              : t('features.qr-tools'),
    description:
      toolTitle === 'Word to PDF'
        ? t('features.word-to-pdf-desc')
        : toolTitle === 'PDF to Word'
          ? t('features.pdf-to-word-desc')
          : toolTitle === 'Image to Word'
            ? t('features.image-to-word-desc')
            : toolTitle === 'Image to PDF'
              ? t('features.image-to-pdf-desc')
              : t('features.qr-tools-desc'),
  }
}

function FeatureMenu({
  label,
  href,
  items,
}: {
  label: string
  href: string
  items: Array<{
    href: string
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }>
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
      </Link>

      <div className="pointer-events-none absolute left-0 top-full z-30 w-[26rem] pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{label}</p>
          </div>
          <div className="grid gap-1 p-2">
            {items.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={`${label}-${item.title}`}
                  href={item.href}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className={`mt-0.5 rounded-lg bg-gradient-to-br ${item.color} p-2 text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { language, t } = useLanguage()
  const jsonTools = JSON_TOOLS.map((tool) => ({
    href: tool.href,
    icon: tool.icon,
    color: tool.color,
    ...getJsonToolTranslation(tool.href, t),
  }))
  const ocrTools = OCR_TOOLS.filter((tool) => tool.title !== 'QR Tools').map((tool) => ({
    href: tool.href,
    icon: tool.icon,
    color: tool.color,
    ...getOcrToolTranslation(tool.title, t),
  }))
  const qrTool = OCR_TOOLS.find((tool) => tool.title === 'QR Tools')
  const qrTools = qrTool
    ? [
        {
          href: qrTool.href,
          icon: qrTool.icon,
          color: qrTool.color,
          ...getOcrToolTranslation(qrTool.title, t),
        },
      ]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/78 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/58 dark:border-white/8 dark:bg-black/28 dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between gap-3 py-3">
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-3 pr-2 sm:flex-none">
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

          <nav className="hidden items-center gap-1 lg:flex">
            <FeatureMenu label={t('header.ocr-tools')} href="/" items={ocrTools} />
            <FeatureMenu label={t('header.converter-tools')} href="/tools" items={jsonTools} />
            <FeatureMenu label={t('features.qr-tools')} href={qrTool?.href || '/'} items={qrTools} />
            <Link
              href="/tools"
              className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('features.view-all')}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}

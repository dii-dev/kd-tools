'use client'

import Link from 'next/link'
import { useLanguage } from '@/hooks'
import { JSON_TOOLS, OCR_TOOLS } from '@/constants'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function ToolsPage() {
  const { t } = useLanguage()
  const jsonTools = JSON_TOOLS.map((tool) => ({
    ...tool,
    title:
      tool.href === '/tools/json-pretty'
        ? t('json.pretty.title')
        : tool.href === '/tools/json-string'
          ? t('json.string.title')
        : tool.href === '/tools/diff-compare'
            ? t('json.diff.title')
          : tool.href === '/tools/xml-to-json'
            ? t('xml.json.title')
          : tool.href === '/tools/soap-to-json'
            ? t('soap.json.title')
            : t('json.format.title'),
    description:
      tool.href === '/tools/json-pretty'
        ? t('json.pretty.subtitle')
        : tool.href === '/tools/json-string'
          ? t('json.string.subtitle')
        : tool.href === '/tools/diff-compare'
            ? t('json.diff.subtitle')
          : tool.href === '/tools/xml-to-json'
            ? t('xml.json.subtitle')
          : tool.href === '/tools/soap-to-json'
            ? t('soap.json.subtitle')
            : t('json.format.subtitle'),
  }))
  const ocrTools = OCR_TOOLS.map((tool) => ({
    ...tool,
    title:
      tool.title === 'Word to PDF'
        ? t('features.word-to-pdf')
        : tool.title === 'PDF to Word'
          ? t('features.pdf-to-word')
          : tool.title === 'Image to Word'
            ? t('features.image-to-word')
            : tool.title === 'Image to PDF'
              ? t('features.image-to-pdf')
              : t('features.qr-tools'),
    description:
      tool.title === 'Word to PDF'
        ? t('features.word-to-pdf-desc')
        : tool.title === 'PDF to Word'
          ? t('features.pdf-to-word-desc')
          : tool.title === 'Image to Word'
            ? t('features.image-to-word-desc')
            : tool.title === 'Image to PDF'
              ? t('features.image-to-pdf-desc')
              : t('features.qr-tools-desc'),
  }))
  const documentOcrTools = ocrTools.filter((tool) => tool.title !== t('features.qr-tools'))
  const qrTools = ocrTools.filter((tool) => tool.title === t('features.qr-tools'))
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_NAME} Tools`,
    url: `${SITE_URL}/tools`,
    description: 'Online JSON, XML, SOAP, OCR, and QR tools from KD Tools.',
    hasPart: [...jsonTools, ...documentOcrTools, ...qrTools].map((tool) => ({
      '@type': 'SoftwareApplication',
      name: tool.title,
      description: tool.description,
      applicationCategory: tool.title === t('features.qr-tools') ? 'UtilitiesApplication' : 'DeveloperApplication',
      url: `${SITE_URL}${tool.href}`,
    })),
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('tools.title')}
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">{t('tools.subtitle')}</p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {jsonTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Link key={tool.href} href={tool.href}>
                  <div className="group h-full rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg sm:p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-full h-full text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-16 border-t border-border pt-16 text-center sm:mt-20 sm:pt-20">
            <h2 className="mb-4 text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('tools.ocr-title')}
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">{t('tools.ocr-subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {documentOcrTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                    <Link key={index} href={tool.href}>
                  <div className="group h-full rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg sm:p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-full h-full text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          {qrTools.length > 0 ? (
            <>
              <div className="mt-16 border-t border-border pt-16 text-center sm:mt-20 sm:pt-20">
                <h2 className="mb-4 text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t('tools.qr-title')}
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">{t('tools.qr-subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:max-w-sm lg:mx-auto lg:gap-6">
                {qrTools.map((tool, index) => {
                  const IconComponent = tool.icon
                  return (
                    <Link key={`qr-${index}`} href={tool.href}>
                      <div className="group h-full rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg sm:p-6">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-full h-full text-white" />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}

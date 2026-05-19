"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"
import { useLanguage } from "@/lib/language-context"

export function CTA() {
  const [converterOpen, setConverterOpen] = useState(false)
  const { t, language } = useLanguage()

  return (
    <>
      <section className="py-20 md:py-32 bg-primary text-primary-foreground dark:bg-[linear-gradient(135deg,rgba(201,145,53,0.22),rgba(148,53,28,0.22),rgba(22,19,22,0.96))] dark:text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center dark:rounded-[2rem] dark:border dark:border-white/10 dark:bg-white/[0.04] dark:px-8 dark:py-12 dark:shadow-[0_26px_80px_rgba(0,0,0,0.35)] dark:backdrop-blur-sm">
            <h2
              className={[
                "text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-6",
                language === "km" ? "leading-[1.45] tracking-[0.02em]" : "",
              ].join(" ")}
            >
              {t('cta.title')}
            </h2>
            <p className="text-lg text-primary-foreground/90 text-balance mb-10 leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
                onClick={() => setConverterOpen(true)}
              >
                {t('cta.primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 dark:border-white/16 dark:text-white dark:hover:bg-white/8"
              >
                {t('cta.secondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Converter isOpen={converterOpen} onClose={() => setConverterOpen(false)} />
    </>
  )
}

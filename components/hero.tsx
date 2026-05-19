"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"
import { useLanguage } from "@/lib/language-context"

export function Hero() {
  const [converterOpen, setConverterOpen] = useState(false)
  const { t, language } = useLanguage()

  return (
    <>
      <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-background -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Khmer cultural badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 text-sm shadow-sm dark:border-primary/25 dark:bg-[linear-gradient(90deg,rgba(255,212,120,0.12),rgba(255,255,255,0.05))] dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                {t('hero.badge')}
              </span>
            </div>

            <h1
              className={[
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 dark:[text-shadow:0_4px_24px_rgba(0,0,0,0.35)]",
                language === "km" ? "leading-[1.28] tracking-[0.015em]" : "tracking-tight",
              ].join(" ")}
            >
              {t('hero.title')}{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-temple-shine dark:from-[#f4c86a] dark:via-[#f09a52] dark:to-[#f4c86a]">
                {t('hero.title-highlight')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25 dark:shadow-[0_18px_45px_rgba(204,145,46,0.32)]"
                onClick={() => setConverterOpen(true)}
              >
                {t('hero.cta-primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105 bg-transparent dark:border-white/12 dark:bg-white/3 dark:hover:bg-white/7"
              >
                {t('hero.cta-secondary')}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6 animate-in fade-in duration-700 delay-500">
              {t('hero.footer-text')}
            </p>
          </div>
        </div>
      </section>

      <Converter isOpen={converterOpen} onClose={() => setConverterOpen(false)} />
    </>
  )
}

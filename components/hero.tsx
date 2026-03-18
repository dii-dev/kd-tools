"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"
import { useLanguage } from "@/lib/language-context"

export function Hero() {
  const [converterOpen, setConverterOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Khmer-inspired background gradient with earth tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-background -z-10" />
        
        {/* Decorative temple-inspired circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-temple-shine -z-10" />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-temple-shine -z-10"
          style={{ animationDelay: "1s" }}
        />
        
        {/* Khmer pattern overlay */}
        <div className="absolute inset-0 opacity-30 -z-10 khmer-pattern" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Khmer cultural badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              {t('hero.title')}{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-temple-shine">
                {t('hero.title-highlight')}
              </span>
              {" "}with precision
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                onClick={() => setConverterOpen(true)}
              >
                {t('hero.cta-primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105 bg-transparent"
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

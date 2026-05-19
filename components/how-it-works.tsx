"use client"

import { Upload, Zap, Download } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function HowItWorks() {
  const { t } = useLanguage()
  const steps = [
    {
      icon: Upload,
      title: t('how.step1.title'),
      description: t('how.step1.desc'),
    },
    {
      icon: Zap,
      title: t('how.step2.title'),
      description: t('how.step2.desc'),
    },
    {
      icon: Download,
      title: t('how.step3.title'),
      description: t('how.step3.desc'),
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">{t('how.title')}</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            {t('how.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-border" />
              )}
              <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground mb-6 text-2xl font-bold">
                {index + 1}
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <step.icon className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, FileType, ArrowRightLeft, QrCode } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"
import { QRGenerator } from "@/components/qr-generator"
import { useLanguage } from "@/lib/language-context"

export function Features() {
  const { t } = useLanguage()
  const [converterOpen, setConverterOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrMode, setQrMode] = useState<"generate" | "decode">("generate")
  const [selectedType, setSelectedType] = useState<"word-to-pdf" | "pdf-to-word" | "image-to-word" | "image-to-pdf">(
    "word-to-pdf",
  )

  const features = [
    {
      icon: FileType,
      title: t('features.word-to-pdf'),
      description: t('features.word-to-pdf-desc'),
      type: "word-to-pdf" as const,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      category: "converter",
    },
    {
      icon: FileText,
      title: t('features.pdf-to-word'),
      description: t('features.pdf-to-word-desc'),
      type: "pdf-to-word" as const,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      category: "converter",
    },
    {
      icon: ImageIcon,
      title: t('features.image-to-word'),
      description: t('features.image-to-word-desc'),
      type: "image-to-word" as const,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      category: "converter",
    },
    {
      icon: ArrowRightLeft,
      title: t('features.image-to-pdf'),
      description: t('features.image-to-pdf-desc'),
      type: "image-to-pdf" as const,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      category: "converter",
    },
    {
      icon: QrCode,
      title: t('features.qr-tools'),
      description: t('features.qr-tools-desc'),
      type: "generate" as const,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
      category: "qr",
    },
  ]

  const handleTryNow = (feature: (typeof features)[0]) => {
    if (feature.category === "converter") {
      setSelectedType(feature.type as typeof selectedType)
      setConverterOpen(true)
    } else if (feature.category === "qr") {
      setQrMode(feature.type as "generate" | "decode")
      setQrOpen(true)
    }
  }

  return (
    <>
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/30 to-background dark:from-background dark:via-white/[0.02] dark:to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* OCR Tools Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('features.ocr-title')}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              {t('features.ocr-subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-primary/10 bg-card/95 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:hover:border-primary/30 dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.34)]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg dark:shadow-[0_14px_30px_rgba(0,0,0,0.3)]`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all bg-transparent dark:border-white/10 dark:bg-white/3 dark:hover:bg-white/7"
                  onClick={() => handleTryNow(feature)}
                >
                  {t('features.try-now')}
                </Button>
              </Card>
            ))}
          </div>

          {/* Converter Tools Section */}
          <div className="text-center mb-16 pt-20 border-t border-border dark:border-white/8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('features.converter-title')}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              {t('features.converter-subtitle')}
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              {t('features.explore-suite')}{" "}
              <a href="/tools" className="text-primary hover:underline font-semibold">
                {t('features.converter-title')}
              </a>
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 dark:shadow-[0_16px_40px_rgba(204,145,46,0.28)]">
              <a href="/tools">{t('features.view-all')}</a>
            </Button>
          </div>
        </div>
      </section>

      <Converter isOpen={converterOpen} onClose={() => setConverterOpen(false)} initialType={selectedType} />
      <QRGenerator isOpen={qrOpen} onClose={() => setQrOpen(false)} initialMode={qrMode} />
    </>
  )
}

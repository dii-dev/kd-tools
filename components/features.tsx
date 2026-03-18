"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, FileType, ArrowRightLeft, QrCode } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"
import { QRGenerator } from "@/components/qr-generator"

const features = [
  {
    icon: FileType,
    title: "Word to PDF",
    description: "Convert Word documents to PDF format while preserving formatting, fonts, and layout perfectly.",
    type: "word-to-pdf" as const,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    category: "converter",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description: "Extract text and formatting from PDFs into editable Word documents with high accuracy.",
    type: "pdf-to-word" as const,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    category: "converter",
  },
  {
    icon: ImageIcon,
    title: "Image to Word",
    description: "Transform scanned documents and images into editable Word files using advanced OCR technology.",
    type: "image-to-word" as const,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    category: "converter",
  },
  {
    icon: ArrowRightLeft,
    title: "Image to PDF",
    description: "Convert images to professional PDF documents with customizable settings and compression.",
    type: "image-to-pdf" as const,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    category: "converter",
  },
  {
    icon: QrCode,
    title: "QR Code Generator",
    description: "Create custom QR codes with optional logo placement in the center for branding purposes.",
    type: "qr-generator" as const,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    category: "qr",
  },
]

export function Features() {
  const [converterOpen, setConverterOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"word-to-pdf" | "pdf-to-word" | "image-to-word" | "image-to-pdf">(
    "word-to-pdf",
  )

  const handleTryNow = (feature: (typeof features)[0]) => {
    if (feature.category === "converter") {
      setSelectedType(feature.type as typeof selectedType)
      setConverterOpen(true)
    } else if (feature.category === "qr") {
      setQrOpen(true)
    }
  }

  return (
    <>
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
              Powerful{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                conversion features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Everything you need to convert documents between formats with precision and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/10 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all bg-transparent"
                  onClick={() => handleTryNow(feature)}
                >
                  Try now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Converter isOpen={converterOpen} onClose={() => setConverterOpen(false)} initialType={selectedType} />
      <QRGenerator isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  )
}

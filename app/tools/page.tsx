'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Zap, Code2, GitCompare, Type, FileText, Image, QrCode, ArrowRightLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ToolsPage() {
  const { t } = useLanguage()

  const jsonTools = [
    {
      icon: Zap,
      title: 'JSON Pretty',
      description: 'Format and beautify your JSON with proper indentation',
      href: '/tools/json-pretty',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Code2,
      title: 'JSON String',
      description: 'Convert JSON strings to a readable formatted structure',
      href: '/tools/json-string',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: GitCompare,
      title: 'JSON Diff Compare',
      description: 'Compare two JSON objects and see all the differences',
      href: '/tools/json-diff',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Type,
      title: 'JSON Format',
      description: 'Format and minify JSON with custom indentation options',
      href: '/tools/json-format',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  const ocrTools = [
    {
      icon: FileText,
      title: 'Word to PDF',
      description: 'Convert Word documents to PDF with perfect formatting',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: FileText,
      title: 'PDF to Word',
      description: 'Extract and convert PDF content to editable Word files',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Image,
      title: 'Image to Word',
      description: 'Convert scanned images and documents to Word using OCR',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: ArrowRightLeft,
      title: 'Image to PDF',
      description: 'Convert images to professional PDF documents',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: QrCode,
      title: 'QR Code Generator',
      description: 'Create QR codes with optional custom logo placement',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Converter Tools Section */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Converter Tools
                </span>
              </h2>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                JSON conversion, formatting, and comparison tools for developers
              </p>
            </div>

            {/* JSON Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {jsonTools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className="group h-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-full h-full text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* OCR Tools Section */}
            <div className="text-center mb-16 mt-20 pt-20 border-t border-border">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-4">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  OCR Tools
                </span>
              </h2>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                Document conversion and OCR technology for Word, PDF, and images
              </p>
            </div>

            {/* OCR Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ocrTools.map((tool, index) => {
                const IconComponent = tool.icon
                return (
                  <Link key={index} href="/">
                    <div className="group h-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-full h-full text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
            })}
          </div>

          {/* Features Section */}
          <div className="mt-20 p-8 bg-secondary/50 rounded-lg border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Why Use KD Converter?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Fast & Reliable</h3>
                <p className="text-muted-foreground text-sm">Instant processing with accurate results for all your conversion needs.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Multilingual Support</h3>
                <p className="text-muted-foreground text-sm">Full support for Khmer and English languages with cultural design.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-muted-foreground text-sm">All conversions happen locally in your browser. No data is stored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

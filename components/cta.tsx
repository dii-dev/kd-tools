"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { Converter } from "@/components/converter"

export function CTA() {
  const [converterOpen, setConverterOpen] = useState(false)

  return (
    <>
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance mb-6">
              Ready to Convert, Compare & Create?
            </h2>
            <p className="text-lg text-primary-foreground/90 text-balance mb-10 leading-relaxed">
              Join thousands of users who trust KD Tools for their OCR and conversion needs. Access all tools for free
              and start converting today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base"
                onClick={() => setConverterOpen(true)}
              >
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Contact sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Converter isOpen={converterOpen} onClose={() => setConverterOpen(false)} />
    </>
  )
}

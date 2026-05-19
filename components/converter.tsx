"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, FileText, ImageIcon, FileType, ArrowRightLeft, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

type ConversionType = "word-to-pdf" | "pdf-to-word" | "image-to-word" | "image-to-pdf"

interface ConverterProps {
  isOpen: boolean
  onClose: () => void
  initialType?: ConversionType
}

export function Converter({ isOpen, onClose, initialType = "word-to-pdf" }: ConverterProps) {
  const { t } = useLanguage()
  const [selectedType, setSelectedType] = useState<ConversionType>(initialType)
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [converted, setConverted] = useState(false)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const conversionOptions = [
    {
      id: "word-to-pdf" as ConversionType,
      icon: FileType,
      label: t('features.word-to-pdf'),
      accept: ".doc,.docx",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "pdf-to-word" as ConversionType,
      icon: FileText,
      label: t('features.pdf-to-word'),
      accept: ".pdf",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "image-to-word" as ConversionType,
      icon: ImageIcon,
      label: t('features.image-to-word'),
      accept: "image/*",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "image-to-pdf" as ConversionType,
      icon: ArrowRightLeft,
      label: t('features.image-to-pdf'),
      accept: "image/*",
      color: "from-orange-500 to-red-500",
    },
  ]

  if (!isOpen) return null

  const getFriendlyError = (status?: number, rawMessage?: string) => {
    const message = (rawMessage || "").toLowerCase()

    if (status === 404) return t("converter.error-unavailable")
    if (status === 413 || message.includes("too large")) return t("converter.error-file-too-large")
    if (status === 415 || message.includes("unsupported") || message.includes("invalid file")) {
      return t("converter.error-unsupported")
    }
    if (message.includes("ocr") || message.includes("tesseract") || message.includes("read text")) {
      return t("converter.error-ocr-failed")
    }
    if (status && status >= 500) return t("converter.error-server")
    if (message.includes("failed to fetch") || message.includes("network")) return t("converter.error-network")

    return t("converter.error-fallback")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setConverted(false)
      setConvertedFileUrl(null)
      setErrorMessage("")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setConverted(false)
      setConvertedFileUrl(null)
      setErrorMessage("")
    }
  }

  const handleConvert = async () => {
    if (!file) return

    setConverting(true)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversionType", selectedType)

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(getFriendlyError(response.status, errorData.error))
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setConvertedFileUrl(url)
      setConverted(true)
    } catch (error) {
      console.error("[v0] Conversion error:", error)
      setErrorMessage(error instanceof Error ? error.message : t('converter.error-fallback'))
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedFileUrl) return

    const a = document.createElement("a")
    a.href = convertedFileUrl
    a.download = getOutputFileName(file?.name || "document", selectedType)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setFile(null)
    setConverted(false)
    setConvertedFileUrl(null)
    setErrorMessage("")
    if (convertedFileUrl) {
      URL.revokeObjectURL(convertedFileUrl)
    }
  }

  const selectedOption = conversionOptions.find((opt) => opt.id === selectedType)
  const outputLabels: Record<ConversionType, string> = {
    "word-to-pdf": t('converter.word-to-pdf-output'),
    "pdf-to-word": t('converter.pdf-to-word-output'),
    "image-to-word": t('converter.image-to-word-output'),
    "image-to-pdf": t('converter.image-to-pdf-output'),
  }
  const outputLabel = outputLabels[selectedType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
      <Card className="max-h-[92vh] w-full max-w-2xl overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              {t('converter.title')}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {conversionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedType(option.id)
                  handleReset()
                }}
                className={cn(
                  "rounded-xl border-2 p-3 transition-all duration-300 sm:p-4 hover:scale-[1.02]",
                  selectedType === option.id
                    ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg"
                    : "border-border hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9",
                    selectedType === option.id ? `bg-gradient-to-br ${option.color}` : "bg-muted",
                  )}
                >
                  <option.icon
                    className={cn("h-4 w-4", selectedType === option.id ? "text-white" : "text-muted-foreground")}
                  />
                </div>
                <p className="text-center text-xs font-medium leading-snug sm:text-sm">{option.label}</p>
              </button>
            ))}
          </div>

          {!file && (
            <div
              className={cn(
                "mb-6 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:p-10",
                dragActive
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border hover:border-primary/50 hover:bg-primary/5",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div
                className={cn(
                "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 sm:h-16 sm:w-16",
                dragActive ? "bg-gradient-to-br from-primary to-accent scale-110" : "bg-primary/10",
              )}
            >
                <Upload
                  className={cn("h-8 w-8 transition-all", dragActive ? "text-white animate-bounce" : "text-primary")}
                />
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">{t('converter.upload-title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('converter.upload-subtitle')}</p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={selectedOption?.accept}
                onChange={handleFileChange}
              />
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <label htmlFor="file-upload" className="cursor-pointer">
                  {t('converter.choose-file')}
                </label>
              </Button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">{t('converter.error-prefix')}</p>
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  <p className="text-xs text-muted-foreground">{t('converter.error-help')}</p>
                </div>
              </div>
            </div>
          )}

          {file && !converted && (
            <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-4 duration-300">
              <Card className="border-primary/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gradient-to-br ${selectedOption?.color}`}
                    >
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleReset} className="self-end hover:bg-destructive/10 sm:self-auto">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              <Button
                onClick={handleConvert}
                disabled={converting}
                className="w-full bg-gradient-to-r from-primary to-accent transition-all hover:opacity-90 sm:hover:scale-[1.01]"
                size="lg"
              >
                {converting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('converter.converting')}
                  </>
                ) : (
                  `${t('converter.convert-to')} ${outputLabel}`
                )}
              </Button>
            </div>
          )}

          {converted && (
            <div className="space-y-4 mb-6 animate-in zoom-in-95 duration-500">
              <div className="py-6 text-center sm:py-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-700 delay-200">
                  <CheckCircle2 className="h-8 w-8 text-white animate-in zoom-in duration-700 delay-200" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('converter.complete-title')}</h3>
                <p className="text-muted-foreground mb-6">{t('converter.complete-subtitle')}</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent shadow-lg transition-all hover:opacity-90 sm:w-auto sm:hover:scale-[1.02]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('converter.download-file')}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent transition-all sm:w-auto sm:hover:scale-[1.02]"
                  >
                    {t('converter.convert-another')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-secondary/50 p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              <strong>{t('converter.note-title')}</strong> {t('converter.note-body')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getOutputFileName(originalName: string, type: ConversionType): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "")
  switch (type) {
    case "word-to-pdf":
    case "image-to-pdf":
      return `${baseName}_converted.pdf`
    case "pdf-to-word":
    case "image-to-word":
      return `${baseName}_converted.docx`
    default:
      return `${baseName}_converted`
  }
}

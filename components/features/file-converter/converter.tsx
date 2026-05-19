"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, FileText, Download, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CONVERSION_OPTIONS } from "@/constants"
import type { ConversionType } from "@/types"
import type { ConverterProps } from "@/types"

export function Converter({ isOpen, onClose, initialType = "word-to-pdf" }: ConverterProps) {
  const [selectedType, setSelectedType] = useState<ConversionType>(initialType)
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [converted, setConverted] = useState(false)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setConverted(false)
      setConvertedFileUrl(null)
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
    }
  }

  const handleConvert = async () => {
    if (!file) return

    setConverting(true)

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
        throw new Error(errorData.error || "Conversion failed")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setConvertedFileUrl(url)
      setConverted(true)
    } catch (error) {
      console.error("[v0] Conversion error:", error)
      alert(`Conversion failed: ${error instanceof Error ? error.message : "Please try again."}`)
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
    if (convertedFileUrl) {
      URL.revokeObjectURL(convertedFileUrl)
    }
  }

  const selectedOption = CONVERSION_OPTIONS.find((opt) => opt.id === selectedType)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Convert Your Documents
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {CONVERSION_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedType(option.id)
                  handleReset()
                }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105",
                  selectedType === option.id
                    ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg"
                    : "border-border hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg mx-auto mb-2 flex items-center justify-center",
                    selectedType === option.id ? `bg-gradient-to-br ${option.color}` : "bg-muted",
                  )}
                >
                  <option.icon
                    className={cn("h-4 w-4", selectedType === option.id ? "text-white" : "text-muted-foreground")}
                  />
                </div>
                <p className="text-sm font-medium text-center">{option.label}</p>
              </button>
            ))}
          </div>

          {!file && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center mb-6 transition-all duration-300",
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
                  "h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300",
                  dragActive ? "bg-gradient-to-br from-primary to-accent scale-110" : "bg-primary/10",
                )}
              >
                <Upload
                  className={cn("h-8 w-8 transition-all", dragActive ? "text-white animate-bounce" : "text-primary")}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload your file</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={selectedOption?.accept}
                onChange={handleFileChange}
              />
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>
          )}

          {file && !converted && (
            <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-4 duration-300">
              <Card className="p-4 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded bg-gradient-to-br ${selectedOption?.color} flex items-center justify-center`}
                    >
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleReset} className="hover:bg-destructive/10">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              <Button
                onClick={handleConvert}
                disabled={converting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105"
                size="lg"
              >
                {converting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  `Convert to ${selectedOption?.label.split(" to ")[1]}`
                )}
              </Button>
            </div>
          )}

          {converted && (
            <div className="space-y-4 mb-6 animate-in zoom-in-95 duration-500">
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-700 delay-200">
                  <CheckCircle2 className="h-8 w-8 text-white animate-in zoom-in duration-700 delay-200" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Conversion Complete!</h3>
                <p className="text-muted-foreground mb-6">Your file has been successfully converted</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="hover:scale-105 transition-all bg-transparent"
                  >
                    Convert Another
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Files are converted using advanced OCR and document processing libraries. Word to
              PDF uses Mammoth.js, PDF to Word uses pdf-parse, and Image to Word uses Tesseract.js for optical character
              recognition.
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

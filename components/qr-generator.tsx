"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, Download, Loader2, CheckCircle2, QrCode, LinkIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface QRGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

export function QRGenerator({ isOpen, onClose }: QRGeneratorProps) {
  const [urlInput, setUrlInput] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")

  if (!isOpen) return null

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size must be less than 5MB")
        return
      }
      setError("")
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
      const file = e.dataTransfer.files[0]
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size must be less than 5MB")
        return
      }
      setError("")
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false

    const httpsUrl = url.startsWith("https://") ? url : `https://${url}`
    try {
      new URL(httpsUrl)
      return httpsUrl.startsWith("https://")
    } catch {
      return false
    }
  }

  const handleGenerate = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!isValidUrl(urlInput)) {
      setError("Please enter a valid HTTPS URL or domain")
      return
    }

    setError("")
    setGenerating(true)

    try {
      const formData = new FormData()
      const finalUrl = urlInput.startsWith("https://") ? urlInput : `https://${urlInput}`
      formData.append("qrValue", finalUrl)
      if (logoFile) {
        formData.append("logo", logoFile)
      }

      const response = await fetch("/api/generate-qr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "QR generation failed")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setQrImageUrl(url)
      setGenerated(true)
    } catch (error) {
      console.error("[v0] QR generation error:", error)
      setError(error instanceof Error ? error.message : "QR generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrImageUrl) return

    const a = document.createElement("a")
    a.href = qrImageUrl
    a.download = "qr-code.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setUrlInput("")
    setLogoFile(null)
    setLogoPreview(null)
    setGenerated(false)
    setError("")
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl)
      setQrImageUrl(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Generate QR Code
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {!generated && (
            <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
              <div className="space-y-2">
                <label htmlFor="url-input" className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-cyan-500" />
                  Enter URL
                </label>
                <input
                  id="url-input"
                  type="text"
                  placeholder="https://example.com or example.com"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value)
                    setError("")
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-background transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-cyan-500" />
                  Upload Logo (Optional)
                </label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg transition-all duration-300 overflow-hidden",
                    dragActive
                      ? "border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 scale-[1.02]"
                      : "border-border hover:border-cyan-500/50 hover:bg-cyan-500/5",
                    logoPreview ? "p-4" : "p-6 sm:p-8",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {logoPreview ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg blur group-hover:blur-md transition-all" />
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="relative h-24 w-24 sm:h-28 sm:w-28 object-contain rounded-lg border-2 border-gray-300 bg-gray-200 p-2"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <p className="text-sm font-medium truncate">{logoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {logoFile && `${(logoFile.size / 1024).toFixed(1)} KB`}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogoFile(null)
                            setLogoPreview(null)
                          }}
                          className="w-full sm:w-auto hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove Logo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 animate-pulse">
                        <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-500" />
                      </div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">Upload Your Logo</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">Drag & drop or click to browse</p>
                      <p className="text-xs text-muted-foreground mb-4">PNG, JPG, SVG • Max 5MB</p>
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <Button
                        asChild
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-all hover:scale-105 shadow-lg w-full sm:w-auto"
                        size="lg"
                      >
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Logo
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating || !urlInput.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          )}

          {generated && (
            <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6 animate-in zoom-in-95 duration-500">
              <div className="text-center py-6 sm:py-8">
                <div className="relative mx-auto mb-4 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center animate-in zoom-in duration-700 delay-200 shadow-2xl">
                    <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-white animate-in zoom-in duration-700 delay-200" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent animate-in slide-in-from-bottom-3 duration-500 delay-300">
                  Success!
                </h3>
                <p className="text-base sm:text-lg font-semibold text-foreground mb-2 animate-in slide-in-from-bottom-3 duration-500 delay-400">
                  {logoFile ? "Your Custom QR Code is Ready!" : "Your QR Code is Ready!"}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground mb-8 animate-in slide-in-from-bottom-3 duration-500 delay-500">
                  {logoFile
                    ? `QR code created with your ${logoFile.name} logo perfectly centered`
                    : "Your scannable QR code is generated and ready to use"}
                </p>

                {qrImageUrl && (
                  <div className="mb-8 animate-in zoom-in duration-700 delay-600">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-2xl blur-2xl" />
                      <div className="relative p-4 sm:p-6 bg-white rounded-2xl shadow-2xl border-2 border-cyan-500/30">
                        <img
                          src={qrImageUrl || "/placeholder.svg"}
                          alt="Generated QR Code"
                          className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56"
                          onError={(e) => {
                            console.log("[v0] Image failed to load, will download instead")
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in slide-in-from-bottom-3 duration-500 delay-700">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all hover:scale-105 hover:shadow-2xl shadow-lg w-full sm:w-auto text-base font-semibold"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download QR Code
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="hover:scale-105 transition-all bg-transparent border-2 w-full sm:w-auto hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:border-cyan-500"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Tip:</strong> Enter any HTTPS URL and optionally upload a logo (PNG,
              JPG, or SVG) to customize your QR code. The logo will be placed in the center.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

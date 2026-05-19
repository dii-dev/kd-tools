"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  CheckCircle2,
  Copy,
  Download,
  ImageIcon,
  LinkIcon,
  Loader2,
  QrCode,
  ScanLine,
  Type,
  Upload,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import type { QRGeneratorProps } from "@/types"

type QRMode = "generate" | "decode"
type FrameStyle = "none" | "rounded" | "badge" | "scan"
type DesignTab = "frame" | "logo" | "color-shape"

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): {
    detect: (
      image: ImageBitmap | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageData,
    ) => Promise<Array<{ rawValue?: string }>>
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function QRGenerator({ isOpen, onClose, initialMode = "generate" }: QRGeneratorProps) {
  const { language, t } = useLanguage()
  const [mode, setMode] = useState<QRMode>(initialMode)
  const [textInput, setTextInput] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [darkColor, setDarkColor] = useState("#111111")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [frameColor, setFrameColor] = useState("#d97706")
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("rounded")
  const [designTab, setDesignTab] = useState<DesignTab>("frame")
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [decodedValue, setDecodedValue] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [initialMode, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePaste = (event: ClipboardEvent) => {
      const imageItem = Array.from(event.clipboardData?.items || []).find((item) =>
        item.type.startsWith("image/"),
      )

      if (!imageItem) return

      const file = imageItem.getAsFile()
      if (!file) return

      event.preventDefault()

      if (mode === "generate") {
        handleLogoChange(file)
        return
      }

      handleQrFileChange(file)
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen || mode !== "generate") return

    if (!textInput.trim()) {
      resetOutput()
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setBusy(true)
      setError("")

      try {
        const formData = new FormData()
        formData.append("qrValue", textInput.trim())
        formData.append("darkColor", darkColor)
        formData.append("lightColor", lightColor)
        formData.append("frameColor", frameColor)
        formData.append("frameStyle", frameStyle)
        formData.append("language", language)
        formData.append("scanLabel", t("qr.frame.scan"))
        if (logoFile) {
          formData.append("logo", logoFile)
        }

        const response = await fetch("/api/generate-qr", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || t("qr.error.generation-failed"))
        }

        const blob = await response.blob()
        if (cancelled) return

        const nextUrl = URL.createObjectURL(blob)
        setQrImageUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl)
          return nextUrl
        })
        setGenerated(true)
      } catch (error) {
        if (cancelled) return
        console.error("[v0] QR generation error:", error)
        setError(error instanceof Error ? error.message : t("qr.error.generation-failed"))
        setGenerated(false)
      } finally {
        if (!cancelled) {
          setBusy(false)
        }
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isOpen, mode, textInput, darkColor, lightColor, frameColor, frameStyle, logoFile, language, t])

  if (!isOpen) return null

  const modeCards = [
    {
      id: "generate" as const,
      icon: QrCode,
      title: t("qr.mode.generate"),
      description: t("qr.mode.generate-desc"),
    },
    {
      id: "decode" as const,
      icon: ScanLine,
      title: t("qr.mode.decode"),
      description: t("qr.mode.decode-desc"),
    },
  ]

  const designTabs = [
    { id: "frame" as const, label: t("qr.tab.frame") },
    { id: "logo" as const, label: t("qr.tab.logo") },
    { id: "color-shape" as const, label: t("qr.tab.color-shape") },
  ]

  const readPreview = (file: File, onLoad: (value: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => onLoad(reader.result as string)
    reader.readAsDataURL(file)
  }

  const resetOutput = () => {
    setGenerated(false)
    setError("")
    setCopied(false)
    setDecodedValue("")
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl)
      setQrImageUrl(null)
    }
  }

  const resetAll = () => {
    setTextInput("")
    setLogoFile(null)
    setLogoPreview(null)
    setDarkColor("#111111")
    setLightColor("#ffffff")
    setFrameColor("#d97706")
    setFrameStyle("rounded")
    setDesignTab("frame")
    setQrFile(null)
    setQrPreview(null)
    resetOutput()
  }

  const handleModeChange = (nextMode: QRMode) => {
    setMode(nextMode)
    setDragActive(false)
    resetAll()
  }

  const handleLogoChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("qr.error.invalid-image"))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("qr.error.logo-too-large"))
      return
    }
    setError("")
    setLogoFile(file)
    readPreview(file, setLogoPreview)
  }

  const handleQrFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("qr.error.invalid-image"))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("qr.error.qr-too-large"))
      return
    }
    setError("")
    setQrFile(file)
    readPreview(file, setQrPreview)
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

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (mode === "generate") {
      handleLogoChange(file)
      return
    }

    handleQrFileChange(file)
  }

  const handleDecode = async () => {
    if (!qrFile) {
      setError(t("qr.error.enter-qr-image"))
      return
    }

    const detectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
    if (!detectorClass) {
      setError(t("qr.error.decode-unsupported"))
      return
    }

    setBusy(true)
    setError("")

    try {
      const detector = new detectorClass({ formats: ["qr_code"] })
      const bitmap = await createImageBitmap(qrFile)
      const results = await detector.detect(bitmap)
      bitmap.close()

      const value = results[0]?.rawValue?.trim()
      if (!value) {
        throw new Error(t("qr.error.decode-failed"))
      }

      setDecodedValue(value)
      setGenerated(true)
    } catch (error) {
      console.error("[v0] QR decode error:", error)
      setError(error instanceof Error ? error.message : t("qr.error.decode-failed"))
    } finally {
      setBusy(false)
    }
  }

  const handlePrimaryAction = async () => {
    resetOutput()
    await handleDecode()
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

  const handleCopy = async () => {
    if (!decodedValue) return
    await navigator.clipboard.writeText(decodedValue)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const canSubmit = mode === "generate" ? Boolean(textInput.trim()) : Boolean(qrFile)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
      <Card className="max-h-[92vh] w-full max-w-3xl overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              {t("qr.title")}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-destructive/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-2">
            {modeCards.map((item) => (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  mode === item.id
                    ? "border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-lg"
                    : "border-border bg-background hover:border-cyan-500/40 hover:bg-cyan-500/5",
                )}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>

          {(mode === "generate" || !generated) && (
            <div className="space-y-4 sm:space-y-6">
              {mode === "generate" ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="text-input" className="flex items-center gap-2 text-sm font-medium">
                      <Type className="h-4 w-4 text-cyan-500" />
                      {t("qr.text-label")}
                    </label>
                    <textarea
                      id="text-input"
                      placeholder={t("qr.text-placeholder")}
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value)
                        setError("")
                      }}
                      className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-base"
                    />
                    <p className="text-xs text-muted-foreground">{t("qr.auto-generate-note")}</p>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.03] p-4 sm:p-5">
                    <div>
                      <h3 className="text-sm font-semibold sm:text-base">{t("qr.design-label")}</h3>
                      <p className="text-xs text-muted-foreground sm:text-sm">{t("qr.design-subtitle")}</p>
                    </div>

                    <div className="border-b border-border">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {designTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setDesignTab(tab.id)}
                            className={cn(
                              "border-b-2 px-2 py-2.5 text-center text-xs font-semibold transition-colors sm:px-3 sm:py-3 sm:text-sm",
                              designTab === tab.id
                                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {designTab === "frame" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-medium">
                          <span>{t("qr.frame-style")}</span>
                          <select
                            value={frameStyle}
                            onChange={(e) => setFrameStyle(e.target.value as FrameStyle)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          >
                            <option value="none">{t("qr.frame.none")}</option>
                            <option value="rounded">{t("qr.frame.rounded")}</option>
                            <option value="badge">{t("qr.frame.badge")}</option>
                            <option value="scan">{t("qr.frame.scan")}</option>
                          </select>
                        </label>

                        <label className="space-y-2 text-sm font-medium">
                          <span>{t("qr.frame-color")}</span>
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                            <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="h-9 w-11 rounded border-0 bg-transparent p-0" />
                            <span className="font-mono text-xs text-muted-foreground">{frameColor}</span>
                          </div>
                        </label>
                      </div>
                    )}

                    {designTab === "color-shape" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-medium">
                          <span>{t("qr.shape-color")}</span>
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                            <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="h-9 w-11 rounded border-0 bg-transparent p-0" />
                            <span className="font-mono text-xs text-muted-foreground">{darkColor}</span>
                          </div>
                        </label>

                        <label className="space-y-2 text-sm font-medium">
                          <span>{t("qr.background-color")}</span>
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                            <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="h-9 w-11 rounded border-0 bg-transparent p-0" />
                            <span className="font-mono text-xs text-muted-foreground">{lightColor}</span>
                          </div>
                        </label>
                      </div>
                    )}

                    {designTab === "logo" && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <ImageIcon className="h-4 w-4 text-cyan-500" />
                          {t("qr.logo-label")}
                        </label>
                        <div
                          className={cn(
                            "overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300",
                            dragActive
                              ? "scale-[1.02] border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                              : "border-border hover:border-cyan-500/50 hover:bg-cyan-500/5",
                            logoPreview ? "p-4" : "p-6 sm:p-8",
                          )}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          {logoPreview ? (
                            <div className="space-y-4">
                              <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-50 to-cyan-50 p-4 dark:from-slate-900 dark:to-slate-800">
                                  <div
                                    className="flex aspect-square items-center justify-center rounded-xl border border-white/70 bg-[linear-gradient(45deg,rgba(15,23,42,0.04)_25%,transparent_25%,transparent_75%,rgba(15,23,42,0.04)_75%),linear-gradient(45deg,rgba(15,23,42,0.04)_25%,transparent_25%,transparent_75%,rgba(15,23,42,0.04)_75%)] bg-[length:18px_18px] bg-[position:0_0,9px_9px] bg-white shadow-inner dark:border-white/10 dark:bg-slate-950"
                                  >
                                    <img
                                      src={logoPreview}
                                      alt={t("qr.logo-alt")}
                                      className="max-h-24 max-w-24 object-contain drop-shadow-sm"
                                    />
                                  </div>
                                </div>

                                <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-background/80 p-4">
                                  <div className="space-y-2 text-center sm:text-left">
                                    <p className="truncate text-sm font-semibold">{logoFile?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {logoFile && `${(logoFile.size / 1024).toFixed(1)} KB`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      PNG, JPG, SVG
                                    </p>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                      <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Upload className="mr-2 h-3.5 w-3.5" />
                                        {t("qr.choose-logo")}
                                      </label>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setLogoFile(null)
                                        setLogoPreview(null)
                                      }}
                                      className="w-full transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                                    >
                                      <X className="mr-1 h-3 w-3" />
                                      {t("qr.remove-logo")}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {frameStyle === "scan" && (
                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                                  {t("qr.logo-scan-note")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 sm:mb-4 sm:h-14 sm:w-14">
                                <Upload className="h-6 w-6 text-cyan-500 sm:h-7 sm:w-7" />
                              </div>
                              <h3 className="mb-1 text-sm font-semibold sm:text-base">{t("qr.logo-title")}</h3>
                              <p className="mb-4 text-xs text-muted-foreground sm:text-sm">{t("qr.logo-subtitle")}</p>
                              <p className="mb-4 text-xs text-muted-foreground">{t("qr.logo-hint")}</p>
                              <input
                                type="file"
                                id="logo-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleLogoChange(file)
                                }}
                              />
                              <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg transition-all hover:scale-105 hover:opacity-90 sm:w-auto" size="lg">
                                <label htmlFor="logo-upload" className="cursor-pointer">
                                  <Upload className="mr-2 h-4 w-4" />
                                  {t("qr.choose-logo")}
                                </label>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ScanLine className="h-4 w-4 text-cyan-500" />
                    {t("qr.upload-qr")}
                  </label>
                  <div
                    className={cn(
                      "overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300",
                      dragActive
                        ? "scale-[1.02] border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                        : "border-border hover:border-cyan-500/50 hover:bg-cyan-500/5",
                      qrPreview ? "p-4" : "p-6 sm:p-8",
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {qrPreview ? (
                      <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <img
                          src={qrPreview}
                          alt={t("qr.decode-image-alt")}
                          className="h-28 w-28 rounded-lg border bg-white object-contain p-2"
                        />
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <p className="truncate text-sm font-medium">{qrFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {qrFile && `${(qrFile.size / 1024).toFixed(1)} KB`}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQrFile(null)
                              setQrPreview(null)
                            }}
                            className="w-full transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                          >
                            <X className="mr-1 h-3 w-3" />
                            {t("qr.remove-qr")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 sm:mb-4 sm:h-14 sm:w-14">
                          <Upload className="h-6 w-6 text-cyan-500 sm:h-7 sm:w-7" />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold sm:text-base">{t("qr.upload-qr-title")}</h3>
                        <p className="mb-4 text-xs text-muted-foreground sm:text-sm">{t("qr.upload-qr-subtitle")}</p>
                        <p className="mb-4 text-xs text-muted-foreground">{t("qr.upload-qr-hint")}</p>
                        <input
                          type="file"
                          id="qr-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleQrFileChange(file)
                          }}
                        />
                        <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg transition-all hover:scale-105 hover:opacity-90 sm:w-auto" size="lg">
                          <label htmlFor="qr-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {t("qr.choose-qr")}
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="animate-in slide-in-from-top-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 duration-300">
                  <p className="text-xs font-medium text-destructive sm:text-sm">{error}</p>
                </div>
              )}

              {mode === "decode" && (
                <Button
                  onClick={handlePrimaryAction}
                  disabled={busy || !canSubmit}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg transition-all hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50"
                  size="lg"
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("qr.decoding")}
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      {t("qr.decode")}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {generated && (
            <div className="animate-in zoom-in-95 space-y-4 sm:space-y-6 duration-500">
              <div className="py-6 text-center sm:py-8">
                <div className="relative mx-auto mb-4 inline-block">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 opacity-50 blur-xl animate-pulse" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl animate-in zoom-in duration-700 delay-200 sm:h-16 sm:w-16">
                    <CheckCircle2 className="h-7 w-7 text-white animate-in zoom-in duration-700 delay-200 sm:h-8 sm:w-8" />
                  </div>
                </div>
                <h3 className="animate-in slide-in-from-bottom-3 mb-3 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-2xl font-bold text-transparent duration-500 delay-300 sm:text-3xl">
                  {t("qr.success-title")}
                </h3>

                {mode === "generate" ? (
                  <>
                    <p className="animate-in slide-in-from-bottom-3 mb-2 text-base font-semibold text-foreground duration-500 delay-400 sm:text-lg">
                      {busy ? t("qr.generating") : logoFile ? t("qr.success-with-logo") : t("qr.success-without-logo")}
                    </p>
                    <p className="animate-in slide-in-from-bottom-3 mb-8 text-sm text-muted-foreground duration-500 delay-500 sm:text-base">
                      {logoFile
                        ? t("qr.success-description-with-logo").replace("{name}", logoFile.name)
                        : t("qr.success-description-without-logo")}
                    </p>

                    {qrImageUrl && (
                      <div className="animate-in zoom-in mb-8 duration-700 delay-600">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 blur-2xl" />
                          <div className="relative rounded-2xl border-2 border-cyan-500/30 bg-white p-3 shadow-2xl sm:p-6">
                            <img
                              src={qrImageUrl}
                              alt={t("qr.image-alt")}
                              className="h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="animate-in slide-in-from-bottom-3 flex flex-col justify-center gap-3 duration-500 delay-700 sm:flex-row">
                      <Button
                        onClick={handleDownload}
                        size="lg"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:from-cyan-600 hover:to-blue-600 hover:shadow-2xl sm:w-auto"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        {t("qr.download")}
                      </Button>
                      <Button
                        onClick={resetAll}
                        variant="outline"
                        size="lg"
                        className="w-full border-2 bg-transparent transition-all hover:scale-105 hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 sm:w-auto"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        {t("qr.create-another")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-base font-semibold text-foreground sm:text-lg">{t("qr.decode-success")}</p>
                    <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-left">
                      <p className="mb-2 text-sm font-medium text-foreground">{t("qr.decode-result-title")}</p>
                      <p className="break-all rounded-lg bg-background p-3 font-mono text-sm text-muted-foreground">
                        {decodedValue || t("qr.decode-placeholder")}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                      <Button
                        onClick={handleCopy}
                        size="lg"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:from-cyan-600 hover:to-blue-600 sm:w-auto"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copied ? t("json.common.copied") : t("qr.copy-result")}
                      </Button>
                      <Button
                        onClick={resetAll}
                        variant="outline"
                        size="lg"
                        className="w-full border-2 bg-transparent transition-all hover:scale-105 hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 sm:w-auto"
                      >
                        <ScanLine className="mr-2 h-4 w-4" />
                        {t("qr.create-another")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 sm:p-4">
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <strong className="text-foreground">{t("qr.tip-title")}</strong>{" "}
              {mode === "generate" ? t("qr.tip-body") : t("qr.tip-decode-body")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

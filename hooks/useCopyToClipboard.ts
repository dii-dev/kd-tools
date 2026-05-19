/**
 * Custom hook for clipboard operations
 */
"use client"

import { useState, useCallback } from "react"

interface UseCopyToClipboardResult {
  copied: boolean
  copy: (text: string) => Promise<void>
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  return { copied, copy }
}

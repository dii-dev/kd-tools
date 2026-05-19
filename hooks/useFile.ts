/**
 * Custom hook for file handling operations
 */
"use client"

import { useState } from "react"

interface UseFileResult {
  file: File | null
  setFile: (file: File | null) => void
  clearFile: () => void
  isValidFile: (file: File, maxSize?: number, allowedTypes?: string[]) => boolean
  getFileSizeString: (size: number) => string
}

export function useFile(): UseFileResult {
  const [file, setFile] = useState<File | null>(null)

  const isValidFile = (
    file: File,
    maxSize: number = 50 * 1024 * 1024, // 50MB default
    allowedTypes: string[] = []
  ): boolean => {
    if (file.size > maxSize) return false
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) return false
    return true
  }

  const getFileSizeString = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const clearFile = () => setFile(null)

  return {
    file,
    setFile,
    clearFile,
    isValidFile,
    getFileSizeString,
  }
}

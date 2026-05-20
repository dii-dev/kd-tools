/**
 * Type definitions for the entire application
 */

// File Conversion Types
export type ConversionType = "word-to-pdf" | "pdf-to-word" | "image-to-word" | "image-to-pdf"

export interface ConverterProps {
  isOpen: boolean
  onClose: () => void
  initialType?: ConversionType
}

export interface ConversionOption {
  id: ConversionType
  icon: React.ComponentType<{ className?: string }>
  label: string
  accept: string
  color: string
}

// QR Generator Types
export interface QRGeneratorProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'generate' | 'decode'
  embedded?: boolean
}

// JSON Editor Types
export interface JsonEditorProps {
  onChange: (value: string) => void
  value: string
  placeholder?: string
  label?: string
  readOnly?: boolean
}

// Tool Types
export interface Tool {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  color: string
  bgColor: string
}

// API Response Types
export interface JsonResult {
  result: string | null
  error: string | null
}

export interface ConversionResult {
  success: boolean
  data?: Blob
  error?: string
}

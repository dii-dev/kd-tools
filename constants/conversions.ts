/**
 * Constants for file conversion feature
 */
import {
  FileType,
  FileText,
  ImageIcon,
  ArrowRightLeft,
} from "lucide-react"
import type { ConversionOption } from "@/types"

export const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    id: "word-to-pdf",
    icon: FileType,
    label: "Word to PDF",
    accept: ".doc,.docx",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pdf-to-word",
    icon: FileText,
    label: "PDF to Word",
    accept: ".pdf",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "image-to-word",
    icon: ImageIcon,
    label: "Image to Word",
    accept: "image/*",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "image-to-pdf",
    icon: ArrowRightLeft,
    label: "Image to PDF",
    accept: "image/*",
    color: "from-orange-500 to-red-500",
  },
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export const FILE_MESSAGES = {
  NO_FILE: "No file selected",
  INVALID_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  CONVERSION_ERROR: "An error occurred during conversion",
  CONVERSION_SUCCESS: "File converted successfully",
}

/**
 * Constants for JSON and OCR tools
 */
import {
  Zap,
  Code2,
  GitCompare,
  Type,
  FileCode2,
  Braces,
  FileText,
  Image,
  QrCode,
  ArrowRightLeft,
} from "lucide-react"
import type { Tool } from "@/types"

export const JSON_TOOLS: Tool[] = [
  {
    icon: Zap,
    title: "JSON Pretty",
    description: "Format and beautify your JSON with proper indentation",
    href: "/tools/json-pretty",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Code2,
    title: "JSON String",
    description: "Convert JSON strings to a readable formatted structure",
    href: "/tools/json-string",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: GitCompare,
    title: "JSON Diff Compare",
    description: "Compare two JSON objects and see all the differences",
    href: "/tools/json-diff",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Type,
    title: "JSON Format",
    description: "Format and minify JSON with custom indentation options",
    href: "/tools/json-format",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: FileCode2,
    title: "XML to JSON",
    description: "Convert XML documents into readable JSON structure",
    href: "/tools/xml-to-json",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
  },
  {
    icon: Braces,
    title: "SOAP to JSON",
    description: "Convert SOAP XML responses into readable JSON",
    href: "/tools/soap-to-json",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
  },
]

export const OCR_TOOLS: Tool[] = [
  {
    icon: FileText,
    title: "Word to PDF",
    description: "Convert Word documents to PDF with perfect formatting",
    href: "/",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description: "Extract and convert PDF content to editable Word files",
    href: "/",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Image,
    title: "Image to Word",
    description: "Convert scanned images and documents to Word using OCR",
    href: "/",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: ArrowRightLeft,
    title: "Image to PDF",
    description: "Convert images to professional PDF documents",
    href: "/",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: QrCode,
    title: "QR Tools",
    description: "Generate QR codes from strings or decode QR images back into text",
    href: "/",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
  },
]

export const JSON_TOOL_NAMES = {
  PRETTY: "json-pretty",
  STRING: "json-string",
  DIFF: "json-diff",
  FORMAT: "json-format",
  XML_TO_JSON: "xml-to-json",
  SOAP_TO_JSON: "soap-to-json",
}

export const OCR_TOOL_NAMES = {
  WORD_TO_PDF: "word-to-pdf",
  PDF_TO_WORD: "pdf-to-word",
  IMAGE_TO_WORD: "image-to-word",
  IMAGE_TO_PDF: "image-to-pdf",
  QR_GENERATOR: "qr-generator",
}

export const QR_GENERATOR_CONFIG = {
  MAX_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_URL_LENGTH: 2953, // QR code standard limit
  DEFAULT_ERROR_CORRECTION: "M",
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
}

export const JSON_MESSAGES = {
  INVALID_JSON: "Invalid JSON format",
  COPY_SUCCESS: "Copied to clipboard",
  DOWNLOAD_SUCCESS: "File downloaded successfully",
  EMPTY_INPUT: "Please enter some JSON",
}

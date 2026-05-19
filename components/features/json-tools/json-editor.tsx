'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Trash2 } from 'lucide-react'
import { useLanguage } from '@/hooks'
import type { JsonEditorProps } from '@/types'

export function JsonEditor({
  onChange,
  value,
  placeholder = 'Enter JSON here...',
  label,
  readOnly = false,
}: JsonEditorProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([value], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = 'output.json'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full h-64 p-4 font-mono text-sm border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="h-8 w-8 p-0"
              title="Clear"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 px-2"
            title={copied ? 'Copied!' : 'Copy'}
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-8 px-2"
            title="Download"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}

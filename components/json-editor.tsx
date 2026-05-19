'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Trash2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface JsonEditorProps {
  onChange: (value: string) => void
  value: string
  placeholder?: string
  label?: string
  readOnly?: boolean
}

export function JsonEditor({ onChange, value, placeholder = 'Enter JSON here...', label, readOnly = false }: JsonEditorProps) {
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
      <div className="rounded-xl border border-border bg-background">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-3 py-2">
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="h-8 px-2 sm:px-3"
              title={t('json.common.clear')}
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('json.common.clear')}</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 px-2 sm:px-3"
            title={copied ? t('json.common.copied') : t('json.common.copy')}
          >
            <Copy className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{copied ? t('json.common.copied') : t('json.common.copy')}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-8 px-2 sm:px-3"
            title={t('json.common.download')}
          >
            <Download className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('json.common.download')}</span>
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="h-64 w-full resize-none rounded-b-xl border-0 bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:p-4"
        />
      </div>
    </div>
  )
}

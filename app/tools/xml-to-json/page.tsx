'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { JsonHighlightedView } from '@/components/json-highlighted-view'
import { ToolsBackButton } from '@/components/tools-back-button'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { xmlToJson } from '@/lib/xml-utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function XmlToJsonPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    const result = xmlToJson(input)
    if (result.error) {
      setError(result.error)
      setOutput('')
    } else {
      setOutput(result.result || '')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <ToolsBackButton />
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{t('xml.json.title')}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('xml.json.subtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <JsonEditor
                value={input}
                onChange={setInput}
                label={t('xml.json.input')}
                placeholder={t('xml.json.placeholder-input')}
              />
            </div>

            <div>
              <JsonHighlightedView
                label={t('xml.json.output')}
                output={output}
                placeholder={t('xml.json.placeholder-output')}
                downloadFileName="xml-to-json-output.json"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              onClick={handleConvert}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 sm:w-auto"
            >
              {t('xml.json.action')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setInput('')
                setOutput('')
                setError('')
              }}
            >
              {t('json.common.clear-all')}
            </Button>
          </div>

          {error && (
            <div className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{t('json.common.error')}</p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {output && !error && (
            <div className="mt-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">{t('xml.json.success')}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

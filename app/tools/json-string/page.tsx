'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { JsonHighlightedView } from '@/components/json-highlighted-view'
import { ToolsBackButton } from '@/components/tools-back-button'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonPrettyString } from '@/lib/json-utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function JsonPrettyStringPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handlePrettyString = () => {
    setError('')
    const result = jsonPrettyString(input)
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
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{t('json.string.title')}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('json.string.subtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <JsonEditor
                value={input}
                onChange={setInput}
                label={t('json.string.input')}
                placeholder={t('json.string.placeholder-input')}
              />
            </div>

            <div>
              <JsonHighlightedView
                label={t('json.string.output')}
                output={output}
                placeholder={t('json.string.placeholder-output')}
                downloadFileName="pretty-string-output.json"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              onClick={handlePrettyString}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 sm:w-auto"
            >
              {t('json.string.action')}
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

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{t('json.common.error')}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {output && !error && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">{t('json.string.success')}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

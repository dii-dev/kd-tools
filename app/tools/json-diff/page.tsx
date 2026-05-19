'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { ToolsBackButton } from '@/components/tools-back-button'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonDiff } from '@/lib/json-utils'
import { Copy, Download } from 'lucide-react'
import { AlertCircle, CheckCircle } from 'lucide-react'

function DiffLine({ line, addedLabel, removedLabel }: { line: string; addedLabel: string; removedLabel: string }) {
  const prefix = line.startsWith('+ ') ? '+' : line.startsWith('- ') ? '-' : ''
  const content = prefix ? line.slice(2) : line
  const separatorIndex = content.indexOf(': ')

  if (!prefix || separatorIndex === -1) {
    return <div className="whitespace-pre-wrap">{line}</div>
  }

  const path = content.slice(0, separatorIndex)
  const value = content.slice(separatorIndex + 2)
  const isAdded = prefix === '+'
  const badgeLabel = isAdded ? addedLabel : removedLabel

  return (
    <div
      className={[
        'flex flex-wrap items-start gap-1 rounded-lg px-3 py-2',
        isAdded
          ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
          : 'bg-rose-500/10 text-rose-900 dark:text-rose-100',
      ].join(' ')}
    >
      <span
        className={[
          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          isAdded
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
        ].join(' ')}
      >
        {badgeLabel}
      </span>
      <span className="font-semibold text-sky-700 dark:text-sky-300">{path}</span>
      <span className="text-muted-foreground">:</span>
      <span className="font-mono text-amber-700 dark:text-amber-300 break-all">{value}</span>
    </div>
  )
}

export default function JsonDiffPage() {
  const { t } = useLanguage()
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleDiff = () => {
    setError('')
    const result = jsonDiff(input1, input2)
    if (result.error) {
      setError(result.error)
      setOutput('')
    } else {
      setOutput(result.result || '')
    }
  }

  const handleCopyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  const handleDownloadOutput = () => {
    if (!output) return

    const element = document.createElement('a')
    const file = new Blob([output], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = 'json-diff-output.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <ToolsBackButton />
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{t('json.diff.title')}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('json.diff.subtitle')}</p>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2 md:gap-8 sm:mb-8">
            <div>
              <JsonEditor
                value={input1}
                onChange={setInput1}
                label={t('json.diff.first')}
                placeholder={t('json.diff.placeholder-first')}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {output || error ? t('json.diff.output') : t('json.diff.second')}
              </label>
              {output || error ? (
                <div className="rounded-xl border border-border bg-background">
                  <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOutput}
                      className="h-8 px-2 sm:px-3"
                      disabled={!output}
                    >
                      <Copy className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">{t('json.common.copy')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadOutput}
                      className="h-8 px-2 sm:px-3"
                      disabled={!output}
                    >
                      <Download className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">{t('json.common.download')}</span>
                    </Button>
                  </div>
                  <div className="min-h-64 space-y-2 overflow-auto p-3 font-mono text-sm sm:p-4">
                    {output ? (
                      output.split('\n').map((line, index) => (
                        <DiffLine
                          key={`${index}-${line}`}
                          line={line}
                          addedLabel={t('json.diff.added-second')}
                          removedLabel={t('json.diff.from-first')}
                        />
                      ))
                    ) : (
                      <span className="text-muted-foreground">{t('json.diff.placeholder-output')}</span>
                    )}
                  </div>
                </div>
              ) : (
                <JsonEditor
                  value={input2}
                  onChange={setInput2}
                  label={undefined}
                  placeholder={t('json.diff.placeholder-second')}
                />
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              onClick={handleDiff}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 sm:w-auto"
            >
              {t('json.diff.action')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setInput1('')
                setInput2('')
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
              <p className="text-sm text-green-700 dark:text-green-300">{t('json.diff.success')}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

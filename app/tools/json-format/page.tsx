'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonFormat, jsonMinify } from '@/lib/json-utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function JsonFormatPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const handleFormat = () => {
    setError('')
    const result = jsonFormat(input, indentSize)
    if (result.error) {
      setError(result.error)
      setOutput('')
    } else {
      setOutput(result.result || '')
    }
  }

  const handleMinify = () => {
    setError('')
    const result = jsonMinify(input)
    if (result.error) {
      setError(result.error)
      setOutput('')
    } else {
      setOutput(result.result || '')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              JSON Format
            </h1>
            <p className="text-lg text-muted-foreground">
              Format, minify, or compress your JSON data
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 p-6 bg-secondary/50 rounded-lg border border-border">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Indent Size
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(parseInt(e.target.value))}
                  className="w-full md:w-32 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                  <option value={1}>Tab</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input */}
            <div>
              <JsonEditor
                value={input}
                onChange={setInput}
                label="Input JSON"
                placeholder="Paste your JSON here..."
              />
            </div>

            {/* Output */}
            <div>
              <JsonEditor
                value={output}
                onChange={() => {}}
                label="Formatted Output"
                placeholder="Output will appear here..."
                readOnly={true}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={handleFormat}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Format JSON
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleMinify}
            >
              Minify JSON
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setInput('')
                setOutput('')
                setError('')
              }}
            >
              Clear All
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {output && !error && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">JSON formatted successfully!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

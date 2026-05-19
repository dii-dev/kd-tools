'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonPretty } from '@/lib/json-utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function JsonPrettyPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handlePretty = () => {
    setError('')
    const result = jsonPretty(input)
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
              JSON Pretty
            </h1>
            <p className="text-lg text-muted-foreground">
              Format and beautify your JSON with proper indentation
            </p>
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

          {/* Action Button */}
          <div className="mt-8 flex gap-4">
            <Button
              size="lg"
              onClick={handlePretty}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Format JSON
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

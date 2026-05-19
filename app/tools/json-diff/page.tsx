'use client'

import { useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonDiff } from '@/lib/json-utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              JSON Diff Compare
            </h1>
            <p className="text-lg text-muted-foreground">
              Compare two JSON objects and see the differences
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Input 1 */}
            <div>
              <JsonEditor
                value={input1}
                onChange={setInput1}
                label="First JSON"
                placeholder="Paste your first JSON here..."
              />
            </div>

            {/* Input 2 */}
            <div>
              <JsonEditor
                value={input2}
                onChange={setInput2}
                label="Second JSON"
                placeholder="Paste your second JSON here..."
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              onClick={handleDiff}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Compare JSON
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setInput1('')
                setInput2('')
                setOutput('')
                setError('')
              }}
            >
              Clear All
            </Button>
          </div>

          {/* Output */}
          {(output || error) && (
            <div className="mt-8">
              <JsonEditor
                value={output}
                onChange={() => {}}
                label="Differences"
                placeholder="Differences will appear here..."
                readOnly={true}
              />
            </div>
          )}

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
              <p className="text-sm text-green-700 dark:text-green-300">Comparison completed!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

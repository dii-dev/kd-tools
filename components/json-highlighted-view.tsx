"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Copy, Download } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

function serializeNodeValue(value: unknown, inlineKey?: string) {
  const serializedValue =
    typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value, null, 2)

  return inlineKey ? JSON.stringify({ [inlineKey]: value }, null, 2) : serializedValue
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-fuchsia-500 dark:text-fuchsia-300">null</span>
  }

  if (typeof value === "string") {
    return <span className="text-emerald-600 dark:text-emerald-300">"{value}"</span>
  }

  if (typeof value === "number") {
    return <span className="text-sky-600 dark:text-sky-300">{value}</span>
  }

  if (typeof value === "boolean") {
    return <span className="text-amber-600 dark:text-amber-300">{String(value)}</span>
  }

  return <span>{String(value)}</span>
}

function getCollapsedPreview(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? "" : "s"}`
  }

  if (value && typeof value === "object") {
    const count = Object.keys(value).length
    return `${count} key${count === 1 ? "" : "s"}`
  }

  return ""
}

function JsonNode({
  value,
  level = 0,
  inlineKey,
  onCopyNode,
}: {
  value: unknown
  level?: number
  inlineKey?: string
  onCopyNode: (value: unknown, inlineKey?: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const nestedClass = level > 0 ? "ml-4 border-l border-border/50 pl-4" : ""
  const isArray = Array.isArray(value)
  const isObject = Boolean(value) && typeof value === "object" && !isArray
  const isCollapsible = isArray || isObject

  if (!isCollapsible) {
    return (
      <div className="group flex items-start gap-2">
        <div className="flex-1">
          {inlineKey ? <span className="text-rose-600 dark:text-rose-300">"{inlineKey}"</span> : null}
          {inlineKey ? <span className="text-muted-foreground">: </span> : null}
          <PrimitiveValue value={value} />
        </div>
        <button
          type="button"
          onClick={() => onCopyNode(value, inlineKey)}
          className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
          aria-label="Copy node"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  if (isArray) {
    const items = value as unknown[]

    if (items.length === 0) {
      return (
        <div className="group flex items-start gap-2">
          <div className="flex-1">
            {inlineKey ? <span className="text-rose-600 dark:text-rose-300">"{inlineKey}"</span> : null}
            {inlineKey ? <span className="text-muted-foreground">: </span> : null}
            <span>[]</span>
          </div>
          <button
            type="button"
            onClick={() => onCopyNode(value, inlineKey)}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
            aria-label="Copy node"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <div className="group flex items-start gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="flex flex-1 items-center gap-1 rounded px-1 text-left hover:bg-muted/50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            {inlineKey ? <span className="text-rose-600 dark:text-rose-300">"{inlineKey}"</span> : null}
            {inlineKey ? <span className="text-muted-foreground">: </span> : null}
            <span>[</span>
            {collapsed ? <span className="text-muted-foreground">{getCollapsedPreview(value)}</span> : null}
            {collapsed ? <span>]</span> : null}
          </button>
          <button
            type="button"
            onClick={() => onCopyNode(value, inlineKey)}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
            aria-label="Copy node"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        {!collapsed ? (
          <>
            <div className={nestedClass || "ml-4"}>
              {items.map((item, index) => (
                <div key={index}>
                  <JsonNode value={item} level={level + 1} onCopyNode={onCopyNode} />
                  {index < items.length - 1 ? "," : ""}
                </div>
              ))}
            </div>
            <div>]</div>
          </>
        ) : null}
      </div>
    )
  }

  const entries = Object.entries(value as Record<string, unknown>)

  if (entries.length === 0) {
    return (
      <div className="group flex items-start gap-2">
        <div className="flex-1">
          {inlineKey ? <span className="text-rose-600 dark:text-rose-300">"{inlineKey}"</span> : null}
          {inlineKey ? <span className="text-muted-foreground">: </span> : null}
          <span>{'{}'}</span>
        </div>
        <button
          type="button"
          onClick={() => onCopyNode(value, inlineKey)}
          className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
          aria-label="Copy node"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="group flex items-start gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="flex flex-1 items-center gap-1 rounded px-1 text-left hover:bg-muted/50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          {inlineKey ? <span className="text-rose-600 dark:text-rose-300">"{inlineKey}"</span> : null}
          {inlineKey ? <span className="text-muted-foreground">: </span> : null}
          <span>{'{'}</span>
          {collapsed ? <span className="text-muted-foreground">{getCollapsedPreview(value)}</span> : null}
          {collapsed ? <span>{'}'}</span> : null}
        </button>
        <button
          type="button"
          onClick={() => onCopyNode(value, inlineKey)}
          className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
          aria-label="Copy node"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className={nestedClass || "ml-4"}>
            {entries.map(([key, nestedValue], index) => (
              <div key={key}>
                <JsonNode value={nestedValue} level={level + 1} inlineKey={key} onCopyNode={onCopyNode} />
                {index < entries.length - 1 ? "," : ""}
              </div>
            ))}
          </div>
          <div>{'}'}</div>
        </>
      ) : null}
    </div>
  )
}

interface JsonHighlightedViewProps {
  label: string
  output: string
  placeholder: string
  downloadFileName?: string
}

export function JsonTreeView({
  value,
  placeholder,
}: {
  value: unknown | null
  placeholder: string
}) {
  const handleCopyNode = async (nodeValue: unknown, inlineKey?: string) => {
    await navigator.clipboard.writeText(serializeNodeValue(nodeValue, inlineKey))
  }

  return (
    <div className="min-h-64 overflow-auto p-3 font-mono text-sm sm:p-4">
      {value !== null ? (
        <JsonNode value={value} onCopyNode={handleCopyNode} />
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </div>
  )
}

export function JsonHighlightedView({
  label,
  output,
  placeholder,
  downloadFileName = "output.json",
}: JsonHighlightedViewProps) {
  const { t } = useLanguage()
  const parsedOutput = output ? JSON.parse(output) : null

  const handleCopyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  const handleDownloadOutput = () => {
    if (!output) return

    const element = document.createElement("a")
    const file = new Blob([output], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = downloadFileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
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
            <span className="hidden sm:inline">{t("json.common.copy")}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadOutput}
            className="h-8 px-2 sm:px-3"
            disabled={!output}
          >
            <Download className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t("json.common.download")}</span>
          </Button>
        </div>
        <JsonTreeView value={parsedOutput} placeholder={placeholder} />
      </div>
    </div>
  )
}

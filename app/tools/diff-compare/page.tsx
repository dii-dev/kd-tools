'use client'

import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { JsonEditor } from '@/components/json-editor'
import { ToolsBackButton } from '@/components/tools-back-button'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { jsonDiff, type JsonDiffResult, type JsonDiffRow } from '@/lib/json-utils'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ChevronUp, Copy, Download, File, FileText, Folder, FolderOpen, Upload, X } from 'lucide-react'

const ROW_HEIGHT = 36
const OVERSCAN_ROWS = 24
const MAX_COMPARE_FILE_SIZE = 100 * 1024 * 1024

type CompareMode = 'text' | 'file' | 'folder'

interface LoadedFileMeta {
  name: string
  size: number
  lineCount: number
  edited: boolean
}

interface ChangeGroupMeta {
  id: number
  firstRowIndex: number
  leftStart: number
  leftDeleteCount: number
  rightStart: number
  rightDeleteCount: number
  leftLines: string[]
  rightLines: string[]
}

interface UndoSnapshot {
  input1: string
  input2: string
  file1: LoadedFileMeta | null
  file2: LoadedFileMeta | null
  folder1: LoadedFolderMeta | null
  folder2: LoadedFolderMeta | null
  folderEntries1: Record<string, FolderFileEntry>
  folderEntries2: Record<string, FolderFileEntry>
  folderDiffEntries: FolderDiffEntry[]
  selectedFolderPath: string | null
  activeGroupId: number | null
}

interface FolderFileEntry {
  path: string
  text: string
  size: number
  lineCount: number
  lastModified: number
}

interface LoadedFolderMeta {
  name: string
  fileCount: number
  totalSize: number
}

type FolderDiffStatus = 'changed' | 'added' | 'removed' | 'unchanged'

interface FolderDiffEntry {
  path: string
  status: FolderDiffStatus
  left: FolderFileEntry | null
  right: FolderFileEntry | null
}

function countLines(text: string) {
  if (!text) return 0
  return text.split('\n').length
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${Math.round(value * 100) / 100} ${units[exponent]}`
}

function formatModifiedTime(timestamp: number) {
  if (!timestamp) return '-'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

interface FolderPreviewRow {
  id: string
  name: string
  fullPath: string
  comparePath: string | null
  depth: number
  type: 'folder' | 'file'
  size: number | null
  lastModified: number | null
}

function buildFolderPreviewRows(folder: LoadedFolderMeta, entries: Record<string, FolderFileEntry>) {
  const rows: FolderPreviewRow[] = []
  const seenFolders = new Set<string>()
  const sortedEntries = Object.values(entries).sort((first, second) => first.path.localeCompare(second.path))

  sortedEntries.forEach((entry) => {
    const segments = entry.path.split('/').filter(Boolean)
    const relativeSegments = segments[0] === folder.name ? segments.slice(1) : segments

    relativeSegments.slice(0, -1).forEach((segment, index) => {
      const folderPath = relativeSegments.slice(0, index + 1).join('/')
      if (seenFolders.has(folderPath)) return

      seenFolders.add(folderPath)
      rows.push({
        id: `folder:${folderPath}`,
        name: segment,
        fullPath: `${folder.name}/${folderPath}`,
        comparePath: null,
        depth: index,
        type: 'folder',
        size: null,
        lastModified: null,
      })
    })

    rows.push({
      id: `file:${entry.path}`,
      name: relativeSegments[relativeSegments.length - 1] || entry.path,
      fullPath: `${folder.name}/${relativeSegments.join('/') || entry.path}`,
      comparePath: entry.path,
      depth: Math.max(0, relativeSegments.length - 1),
      type: 'file',
      size: entry.size,
      lastModified: entry.lastModified,
    })
  })

  return rows
}

function formatFolderPathLabel(folderName: string) {
  return `.../${folderName}`
}

function createLoadedFileMeta(file: File, text: string, edited = false): LoadedFileMeta {
  return {
    name: file.name,
    size: file.size,
    lineCount: countLines(text),
    edited,
  }
}

function buildFolderDiffEntries(
  leftEntries: Record<string, FolderFileEntry>,
  rightEntries: Record<string, FolderFileEntry>,
) {
  const paths = Array.from(new Set([...Object.keys(leftEntries), ...Object.keys(rightEntries)])).sort((first, second) =>
    first.localeCompare(second),
  )

  return paths.map<FolderDiffEntry>((path) => {
    const left = leftEntries[path] ?? null
    const right = rightEntries[path] ?? null

    if (left && right) {
      return {
        path,
        status: left.text === right.text ? 'unchanged' : 'changed',
        left,
        right,
      }
    }

    if (left) {
      return {
        path,
        status: 'removed',
        left,
        right: null,
      }
    }

    return {
      path,
      status: 'added',
      left: null,
      right: right,
    }
  })
}

function getFolderStatusClasses(status: FolderDiffStatus, active: boolean) {
  const base = active ? 'border-primary bg-primary/8 text-foreground' : 'border-border bg-background text-foreground'

  if (status === 'changed') {
    return `${base} ${active ? 'ring-1 ring-primary/40' : ''}`
  }

  if (status === 'added') {
    return `${base} ${active ? 'ring-1 ring-emerald-500/40' : ''}`
  }

  if (status === 'removed') {
    return `${base} ${active ? 'ring-1 ring-rose-500/40' : ''}`
  }

  return `${base} opacity-80`
}

function getFolderStatusBadgeClasses(status: FolderDiffStatus) {
  if (status === 'changed') return 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
  if (status === 'added') return 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
  if (status === 'removed') return 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
  return 'bg-muted text-muted-foreground'
}

function updateLoadedFileMeta(meta: LoadedFileMeta | null, text: string) {
  if (!meta) return meta
  return {
    ...meta,
    size: new Blob([text]).size,
    lineCount: countLines(text),
    edited: true,
  }
}

function renderHighlightedLine(content: string) {
  if (!content) {
    return ' '
  }

  const keyMatch = content.match(/^(\s*)"([^"\\]*(?:\\.[^"\\]*)*)":\s*(.*)$/)
  if (keyMatch) {
    const [, indent, key, value] = keyMatch
    return (
      <>
        <span>{indent}</span>
        <span className="text-rose-600 dark:text-rose-300">"{key}"</span>
        <span className="text-muted-foreground">: </span>
        {renderJsonValue(value)}
      </>
    )
  }

  return renderJsonValue(content)
}

function renderJsonValue(value: string) {
  const trimmed = value.trim()
  const leadingWhitespace = value.slice(0, value.length - trimmed.length)

  if (!trimmed) {
    return <span>{value}</span>
  }

  if (trimmed === 'true' || trimmed === 'false') {
    return (
      <>
        <span>{leadingWhitespace}</span>
        <span className="text-amber-600 dark:text-amber-300">{trimmed}</span>
      </>
    )
  }

  if (trimmed === 'null') {
    return (
      <>
        <span>{leadingWhitespace}</span>
        <span className="text-fuchsia-500 dark:text-fuchsia-300">null</span>
      </>
    )
  }

  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?[,]?$/.test(trimmed)) {
    return (
      <>
        <span>{leadingWhitespace}</span>
        <span className="text-sky-600 dark:text-sky-300">{trimmed}</span>
      </>
    )
  }

  if (/^"([^"\\]|\\.)*"[,]?$/.test(trimmed)) {
    return (
      <>
        <span>{leadingWhitespace}</span>
        <span className="text-emerald-600 dark:text-emerald-300">{trimmed}</span>
      </>
    )
  }

  return <span>{value}</span>
}

function lineStateClasses(state: JsonDiffRow['leftType'] | JsonDiffRow['rightType'], side: 'left' | 'right', isActive: boolean) {
  if (state === 'modified') {
    if (side === 'right') {
      return [
        'bg-sky-500/22 text-sky-950 dark:bg-sky-400/20 dark:text-sky-50',
        isActive ? 'ring-1 ring-inset ring-sky-500/60 dark:ring-sky-300/60' : '',
      ]
        .filter(Boolean)
        .join(' ')
    }

    return 'bg-sky-500/12 text-sky-950 dark:bg-sky-400/10 dark:text-sky-100'
  }

  if (state === 'added') {
    if (side === 'right') {
      return [
        'bg-emerald-500/22 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-50',
        isActive ? 'ring-1 ring-inset ring-emerald-500/60 dark:ring-emerald-300/60' : '',
      ]
        .filter(Boolean)
        .join(' ')
    }

    return 'bg-emerald-500/14 text-emerald-950 dark:bg-emerald-400/14 dark:text-emerald-100'
  }

  if (state === 'removed') {
    return 'bg-rose-500/14 text-rose-950 dark:bg-rose-400/14 dark:text-rose-100'
  }

  if (state === 'empty') {
    return 'bg-muted/25 text-muted-foreground'
  }

  return 'bg-transparent text-foreground'
}

function buildDiffText(diff: JsonDiffResult) {
  const lines: string[] = []

  for (const row of diff.rows) {
    if (row.leftType === 'unchanged' && row.rightType === 'unchanged') {
      lines.push(`  ${row.leftContent}`)
      continue
    }

    if (row.leftType === 'modified' && row.rightType === 'modified') {
      lines.push(`- ${row.leftContent}`)
      lines.push(`+ ${row.rightContent}`)
      continue
    }

    if (row.leftType === 'removed') {
      lines.push(`- ${row.leftContent}`)
    }

    if (row.rightType === 'added') {
      lines.push(`+ ${row.rightContent}`)
    }
  }

  return lines.join('\n')
}

function buildChangeGroups(rows: JsonDiffRow[]) {
  const groups = new Map<number, ChangeGroupMeta>()

  rows.forEach((row, rowIndex) => {
    if (row.changeGroup === null) return

    const existing = groups.get(row.changeGroup)

    if (!existing) {
      groups.set(row.changeGroup, {
        id: row.changeGroup,
        firstRowIndex: rowIndex,
        leftStart: row.leftCursor,
        leftDeleteCount: row.leftType === 'empty' ? 0 : 1,
        rightStart: row.rightCursor,
        rightDeleteCount: row.rightType === 'empty' ? 0 : 1,
        leftLines: row.leftType === 'empty' ? [] : [row.leftContent],
        rightLines: row.rightType === 'empty' ? [] : [row.rightContent],
      })
      return
    }

    existing.leftStart = Math.min(existing.leftStart, row.leftCursor)
    existing.rightStart = Math.min(existing.rightStart, row.rightCursor)

    if (row.leftType !== 'empty') {
      existing.leftDeleteCount += 1
      existing.leftLines.push(row.leftContent)
    }

    if (row.rightType !== 'empty') {
      existing.rightDeleteCount += 1
      existing.rightLines.push(row.rightContent)
    }
  })

  return groups
}

function DiffCodeCell({
  lineNumber,
  content,
  state,
  side,
  isActive,
}: {
  lineNumber: number | null
  content: string
  state: JsonDiffRow['leftType'] | JsonDiffRow['rightType']
  side: 'left' | 'right'
  isActive: boolean
}) {
  return (
    <div className={`grid h-9 min-w-0 grid-cols-[3rem_minmax(0,1fr)] border-b border-border/60 ${lineStateClasses(state, side, isActive)}`}>
      <div className="border-r border-border/50 px-3 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {lineNumber ?? ''}
      </div>
      <pre className="overflow-hidden px-3 py-1.5 font-mono text-sm leading-6 whitespace-pre">
        {renderHighlightedLine(content)}
      </pre>
    </div>
  )
}

function DiffRowView({
  row,
  rowIndex,
  group,
  onApplyToFirst,
  onApplyToSecond,
  applyToFirstLabel,
  applyToSecondLabel,
  isActive,
}: {
  row: JsonDiffRow
  rowIndex: number
  group: ChangeGroupMeta | null
  onApplyToFirst: (group: ChangeGroupMeta) => void
  onApplyToSecond: (group: ChangeGroupMeta) => void
  applyToFirstLabel: string
  applyToSecondLabel: string
  isActive: boolean
}) {
  const showActions = group && group.firstRowIndex === rowIndex

  return (
    <div className="grid min-w-[1080px] grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)]">
      <DiffCodeCell lineNumber={row.leftLineNumber} content={row.leftContent} state={row.leftType} side="left" isActive={isActive} />
      <div className="flex h-9 items-center justify-center border-b border-x border-border/60 bg-muted/40 px-2">
        {group ? (
          showActions ? (
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                className="h-7 w-7 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                title={applyToFirstLabel}
                onClick={() => onApplyToFirst(group)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="w-4 text-center text-[11px] font-semibold text-muted-foreground">{group.id}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                className="h-7 w-7 text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                title={applyToSecondLabel}
                onClick={() => onApplyToSecond(group)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground">{group.id}</span>
          )
        ) : (
          <div className="h-3 w-px bg-border/80" />
        )}
      </div>
      <DiffCodeCell lineNumber={row.rightLineNumber} content={row.rightContent} state={row.rightType} side="right" isActive={isActive} />
    </div>
  )
}

function FileCompareCard({
  inputId,
  label,
  file,
  value,
  chooseLabel,
  replaceLabel,
  clearLabel,
  hint,
  loadedLabel,
  linesLabel,
  placeholder,
  onTextChange,
  onFileChange,
  onClear,
}: {
  inputId: string
  label: string
  file: LoadedFileMeta | null
  value: string
  chooseLabel: string
  replaceLabel: string
  clearLabel: string
  hint: string
  loadedLabel: string
  linesLabel: string
  placeholder: string
  onTextChange: (value: string) => void
  onFileChange: (file: File) => void
  onClear: () => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <div className="rounded-2xl border border-dashed border-border bg-background/70 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            {file ? (
              <>
                <p className="truncate text-sm font-semibold text-foreground">
                  {file.name}
                  {file.edited ? ' (modified)' : ''}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loadedLabel} • {file.lineCount.toLocaleString()} {linesLabel} • {formatFileSize(file.size)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">{hint}</p>
                <p className="mt-1 text-sm text-muted-foreground">.json, .txt, .log, .xml, .csv, .md and other text files</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept=".json,.txt,.log,.xml,.csv,.md,.yaml,.yml,.js,.ts,.jsx,.tsx,.sql,.html,.css,*/*"
            onChange={(event) => {
              const nextFile = event.target.files?.[0]
              if (nextFile) {
                onFileChange(nextFile)
              }
              event.currentTarget.value = ''
            }}
          />
          <label htmlFor={inputId}>
            <Button type="button" asChild variant="outline" className="cursor-pointer">
              <span>
                <Upload className="h-4 w-4" />
                {file ? replaceLabel : chooseLabel}
              </span>
            </Button>
          </label>
          {file ? (
            <Button type="button" variant="ghost" onClick={onClear}>
              <X className="h-4 w-4" />
              {clearLabel}
            </Button>
          ) : null}
        </div>

        <textarea
          value={value}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={placeholder}
          className="mt-4 h-72 w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )
}

function FolderCompareCard({
  inputId,
  label,
  folder,
  folderEntries,
  diffEntriesByPath,
  selectedPath,
  chooseLabel,
  replaceLabel,
  clearLabel,
  hint,
  readyLabel,
  filesLabel,
  changedLabel,
  addedLabel,
  removedLabel,
  unchangedLabel,
  onFolderChange,
  onSelectPath,
  onClear,
}: {
  inputId: string
  label: string
  folder: LoadedFolderMeta | null
  folderEntries: Record<string, FolderFileEntry>
  diffEntriesByPath: Record<string, FolderDiffEntry>
  selectedPath: string | null
  chooseLabel: string
  replaceLabel: string
  clearLabel: string
  hint: string
  readyLabel: string
  filesLabel: string
  changedLabel: string
  addedLabel: string
  removedLabel: string
  unchangedLabel: string
  onFolderChange: (files: FileList) => void
  onSelectPath: (path: string) => void
  onClear: () => void
}) {
  const previewRows = folder ? buildFolderPreviewRows(folder, folderEntries) : []
  const labelByStatus: Record<FolderDiffStatus, string> = {
    changed: changedLabel,
    added: addedLabel,
    removed: removedLabel,
    unchanged: unchangedLabel,
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] shadow-[0_18px_60px_rgba(0,0,0,0.04)]">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-5">
          <div className="flex items-start gap-4">
            <div className={`rounded-2xl p-3 ${folder ? 'bg-primary/12 text-primary' : 'bg-orange-500/10 text-orange-600 dark:text-orange-300'}`}>
              {folder ? <FolderOpen className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {folder ? readyLabel : 'Folder upload'}
                </span>
                {folder ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {folder.fileCount.toLocaleString()} {filesLabel}
                  </span>
                ) : null}
              </div>

              {folder ? (
                <>
                  <p className="mt-3 break-all text-lg font-semibold tracking-[-0.02em] text-foreground">{folder.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {readyLabel} • {folder.fileCount.toLocaleString()} {filesLabel} • {formatFileSize(folder.totalSize)}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-foreground">{hint}</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Upload a whole folder to inspect nested files, compare matching paths, and open row-by-row diffs from the tree.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <input
            id={inputId}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => {
              const nextFiles = event.target.files
              if (nextFiles && nextFiles.length > 0) {
                onFolderChange(nextFiles)
              }
              event.currentTarget.value = ''
            }}
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          />

          {!folder ? (
            <label htmlFor={inputId} className="block cursor-pointer">
              <div className="rounded-3xl border border-dashed border-border/80 bg-background px-5 py-8 transition-colors hover:border-primary/50 hover:bg-primary/[0.03]">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-foreground">{chooseLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pick a folder from your device to start the comparison tree.</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1">Nested folders</span>
                    <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1">Large file lists</span>
                    <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1">Path-based matching</span>
                  </div>
                </div>
              </div>
            </label>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor={inputId}>
                <Button type="button" asChild className="cursor-pointer rounded-xl px-4">
                  <span>
                    <Upload className="h-4 w-4" />
                    {replaceLabel}
                  </span>
                </Button>
              </label>
              <Button type="button" variant="outline" className="rounded-xl px-4" onClick={onClear}>
                <X className="h-4 w-4" />
                {clearLabel}
              </Button>
              <div className="text-xs text-muted-foreground">
                Click any file in the tree below to open its diff.
              </div>
            </div>
          )}

          {folder ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
              <div className="border-b border-border bg-muted/20 px-4 py-3">
                <div className="inline-flex max-w-full items-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                  <div className="border-r border-border px-3 py-2 text-muted-foreground">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div className="max-w-full px-4 py-2 text-sm text-foreground">
                    <span className="block break-all">{formatFolderPathLabel(folder.name)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[minmax(320px,1.9fr)_120px_240px_120px] gap-x-4 border-b border-border bg-muted/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <div>Name</div>
                <div className="text-right">Size</div>
                <div>Modification time</div>
                <div className="text-right">Status</div>
              </div>
              <div className="max-h-80 overflow-auto">
                {previewRows.map((row) => {
                  const diffEntry = row.comparePath ? diffEntriesByPath[row.comparePath] : null
                  const isSelected = row.comparePath !== null && selectedPath === row.comparePath
                  const rowStatus = diffEntry?.status ?? null
                  const isInteractive = row.comparePath !== null && diffEntry !== undefined

                  const content = (
                    <div
                      className={`grid grid-cols-[minmax(320px,1.9fr)_120px_240px_120px] gap-x-4 items-start border-b border-border/60 px-4 py-2.5 text-sm last:border-b-0 ${
                        isSelected ? 'bg-primary/8' : isInteractive ? 'hover:bg-muted/45' : ''
                      }`}
                    >
                      <div
                        className="flex min-w-0 items-center gap-2"
                        style={{ paddingLeft: `${row.depth * 18}px` }}
                        title={row.fullPath}
                      >
                        {row.type === 'folder' ? (
                          <>
                            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <Folder className="h-4 w-4 flex-shrink-0 text-sky-600" />
                            <span className="min-w-0 break-words [overflow-wrap:anywhere] font-medium text-foreground">{row.name}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 flex-shrink-0" />
                            <File className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span className={`min-w-0 break-words [overflow-wrap:anywhere] ${isInteractive ? 'text-foreground' : 'text-muted-foreground'}`}>{row.name}</span>
                          </>
                        )}
                      </div>
                      <div className="pt-1 text-right font-mono text-xs text-muted-foreground">
                        {row.size === null ? '' : formatFileSize(row.size)}
                      </div>
                      <div className="pt-1 text-xs text-muted-foreground">
                        {row.lastModified ? formatModifiedTime(row.lastModified) : ''}
                      </div>
                      <div className="flex justify-end pt-1">
                        {rowStatus ? (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getFolderStatusBadgeClasses(rowStatus)}`}>
                            {labelByStatus[rowStatus]}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )

                  if (!isInteractive) {
                    return <div key={row.id}>{content}</div>
                  }

                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => onSelectPath(row.comparePath!)}
                      className={`block w-full text-left ${isSelected ? 'ring-1 ring-inset ring-primary/40' : ''}`}
                    >
                      {content}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function FolderDiffList({
  entries,
  selectedPath,
  onSelect,
  changedLabel,
  addedLabel,
  removedLabel,
  unchangedLabel,
}: {
  entries: FolderDiffEntry[]
  selectedPath: string | null
  onSelect: (entry: FolderDiffEntry) => void
  changedLabel: string
  addedLabel: string
  removedLabel: string
  unchangedLabel: string
}) {
  const labelByStatus: Record<FolderDiffStatus, string> = {
    changed: changedLabel,
    added: addedLabel,
    removed: removedLabel,
    unchanged: unchangedLabel,
  }

  return (
    <div className="rounded-2xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Files</p>
      </div>
      <div className="max-h-[28rem] overflow-auto p-2">
        {entries.map((entry) => (
          <button
            key={entry.path}
            type="button"
            onClick={() => onSelect(entry)}
            className={`mb-2 w-full rounded-xl border px-3 py-3 text-left transition-colors ${getFolderStatusClasses(entry.status, selectedPath === entry.path)}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{entry.path}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getFolderStatusBadgeClasses(entry.status)}`}>
                {labelByStatus[entry.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {(entry.left?.lineCount ?? 0).toLocaleString()} / {(entry.right?.lineCount ?? 0).toLocaleString()} lines
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function VirtualizedDiffRows({
  rows,
  groups,
  onApplyToFirst,
  onApplyToSecond,
  firstLabel,
  secondLabel,
  applyToFirstLabel,
  applyToSecondLabel,
  activeGroupId,
}: {
  rows: JsonDiffRow[]
  groups: Map<number, ChangeGroupMeta>
  onApplyToFirst: (group: ChangeGroupMeta) => void
  onApplyToSecond: (group: ChangeGroupMeta) => void
  firstLabel: string
  secondLabel: string
  applyToFirstLabel: string
  applyToSecondLabel: string
  activeGroupId: number | null
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(640)

  useEffect(() => {
    if (!viewportRef.current || typeof ResizeObserver === 'undefined') return

    const element = viewportRef.current
    const observer = new ResizeObserver((entries) => {
      const nextHeight = entries[0]?.contentRect.height
      if (nextHeight) {
        setViewportHeight(nextHeight)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT)
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS)
  const endIndex = Math.min(rows.length, startIndex + visibleCount + OVERSCAN_ROWS * 2)
  const visibleRows = rows.slice(startIndex, endIndex)

  useEffect(() => {
    if (!viewportRef.current || activeGroupId === null) return

    const group = groups.get(activeGroupId)
    if (!group) return

    const targetTop = Math.max(0, group.firstRowIndex * ROW_HEIGHT - viewportHeight / 3)
    viewportRef.current.scrollTo({ top: targetTop, behavior: 'smooth' })
  }, [activeGroupId, groups, viewportHeight])

  return (
    <>
      <div className="grid min-w-[1080px] grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] border-b border-border/60 bg-muted/35">
        <div className="border-r border-border/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{firstLabel}</p>
        </div>
        <div className="border-x border-border/60 px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Diff
        </div>
        <div className="border-l border-border/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{secondLabel}</p>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="h-[70vh] overflow-auto"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div className="relative min-w-[1080px]" style={{ height: rows.length * ROW_HEIGHT }}>
          <div style={{ transform: `translateY(${startIndex * ROW_HEIGHT}px)` }}>
            {visibleRows.map((row, index) => {
              const rowIndex = startIndex + index
              return (
                <DiffRowView
                  key={`${rowIndex}-${row.leftLineNumber}-${row.rightLineNumber}-${row.changeGroup}`}
                  row={row}
                  rowIndex={rowIndex}
                  group={row.changeGroup !== null ? groups.get(row.changeGroup) ?? null : null}
                  onApplyToFirst={onApplyToFirst}
                  onApplyToSecond={onApplyToSecond}
                  applyToFirstLabel={applyToFirstLabel}
                  applyToSecondLabel={applyToSecondLabel}
                  isActive={row.changeGroup !== null && row.changeGroup === activeGroupId}
                />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default function DiffComparePage() {
  const { t } = useLanguage()
  const [mode, setMode] = useState<CompareMode>('text')
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [file1, setFile1] = useState<LoadedFileMeta | null>(null)
  const [file2, setFile2] = useState<LoadedFileMeta | null>(null)
  const [folder1, setFolder1] = useState<LoadedFolderMeta | null>(null)
  const [folder2, setFolder2] = useState<LoadedFolderMeta | null>(null)
  const [folderEntries1, setFolderEntries1] = useState<Record<string, FolderFileEntry>>({})
  const [folderEntries2, setFolderEntries2] = useState<Record<string, FolderFileEntry>>({})
  const [folderDiffEntries, setFolderDiffEntries] = useState<FolderDiffEntry[]>([])
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null)
  const [diffResult, setDiffResult] = useState<JsonDiffResult | null>(null)
  const [error, setError] = useState('')
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([])

  const changeGroups = useMemo(() => (diffResult ? buildChangeGroups(diffResult.rows) : new Map<number, ChangeGroupMeta>()), [diffResult])
  const orderedGroupIds = useMemo(() => Array.from(changeGroups.values()).sort((a, b) => a.firstRowIndex - b.firstRowIndex).map((group) => group.id), [changeGroups])
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const folderDiffEntriesByPath = useMemo(
    () => Object.fromEntries(folderDiffEntries.map((entry) => [entry.path, entry])),
    [folderDiffEntries],
  )

  useEffect(() => {
    setFolderDiffEntries(buildFolderDiffEntries(folderEntries1, folderEntries2))
  }, [folderEntries1, folderEntries2])

  const runCompare = (leftValue: string, rightValue: string) => {
    setError('')
    const result = jsonDiff(leftValue, rightValue)

    if (result.error) {
      setError(result.error)
      setDiffResult(null)
      setActiveGroupId(null)
      return
    }

    setDiffResult(result.result)
    const nextGroups = buildChangeGroups(result.result.rows)
    const firstGroup = Array.from(nextGroups.values()).sort((a, b) => a.firstRowIndex - b.firstRowIndex)[0]
    setActiveGroupId(firstGroup?.id ?? null)
  }

  const handleCompare = () => {
    if (mode === 'folder') {
      const firstRelevantEntry =
        folderDiffEntries.find((entry) => entry.status !== 'unchanged') ?? folderDiffEntries[0] ?? null

      if (!firstRelevantEntry) {
        setInput1('')
        setInput2('')
        setDiffResult(null)
        setSelectedFolderPath(null)
        return
      }

      selectFolderDiffEntry(firstRelevantEntry)
      return
    }

    runCompare(input1, input2)
  }

  const handleCopyOutput = async () => {
    if (!diffResult) return
    await navigator.clipboard.writeText(buildDiffText(diffResult))
  }

  const handleDownloadOutput = () => {
    if (!diffResult) return

    const element = document.createElement('a')
    const file = new Blob([buildDiffText(diffResult)], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download =
      mode === 'folder' ? 'folder-diff-output.diff' : mode === 'file' ? 'file-diff-output.diff' : 'text-diff-output.diff'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const pushUndoSnapshot = () => {
    setUndoStack((current) => [
      ...current,
      {
        input1,
        input2,
        file1,
        file2,
        folder1,
        folder2,
        folderEntries1,
        folderEntries2,
        folderDiffEntries,
        selectedFolderPath,
        activeGroupId,
      },
    ])
  }

  const applyUpdatedInputs = (nextLeft: string, nextRight: string) => {
    startTransition(() => {
      setInput1(nextLeft)
      setInput2(nextRight)
      setFile1((current) => updateLoadedFileMeta(current, nextLeft))
      setFile2((current) => updateLoadedFileMeta(current, nextRight))
      if (mode === 'folder' && selectedFolderPath) {
        setFolderEntries1((current) => ({
          ...current,
          [selectedFolderPath]: {
            path: selectedFolderPath,
            text: nextLeft,
            size: new Blob([nextLeft]).size,
            lineCount: countLines(nextLeft),
            lastModified: current[selectedFolderPath]?.lastModified ?? Date.now(),
          },
        }))
        setFolderEntries2((current) => ({
          ...current,
          [selectedFolderPath]: {
            path: selectedFolderPath,
            text: nextRight,
            size: new Blob([nextRight]).size,
            lineCount: countLines(nextRight),
            lastModified: current[selectedFolderPath]?.lastModified ?? Date.now(),
          },
        }))
        setFolderDiffEntries((current) => {
          const nextLeftEntries = {
            ...folderEntries1,
            [selectedFolderPath]: {
              path: selectedFolderPath,
              text: nextLeft,
              size: new Blob([nextLeft]).size,
              lineCount: countLines(nextLeft),
              lastModified: folderEntries1[selectedFolderPath]?.lastModified ?? Date.now(),
            },
          }
          const nextRightEntries = {
            ...folderEntries2,
            [selectedFolderPath]: {
              path: selectedFolderPath,
              text: nextRight,
              size: new Blob([nextRight]).size,
              lineCount: countLines(nextRight),
              lastModified: folderEntries2[selectedFolderPath]?.lastModified ?? Date.now(),
            },
          }
          return buildFolderDiffEntries(nextLeftEntries, nextRightEntries)
        })
      }
    })
    runCompare(nextLeft, nextRight)
  }

  const handleApplyToFirst = (group: ChangeGroupMeta) => {
    pushUndoSnapshot()
    const leftLines = input1.split('\n')
    leftLines.splice(group.leftStart, group.leftDeleteCount, ...group.rightLines)
    applyUpdatedInputs(leftLines.join('\n'), input2)
  }

  const handleApplyToSecond = (group: ChangeGroupMeta) => {
    pushUndoSnapshot()
    const rightLines = input2.split('\n')
    rightLines.splice(group.rightStart, group.rightDeleteCount, ...group.leftLines)
    applyUpdatedInputs(input1, rightLines.join('\n'))
  }

  const handleUndoChange = () => {
    const snapshot = undoStack[undoStack.length - 1]
    if (!snapshot) return

    setUndoStack((current) => current.slice(0, -1))
    startTransition(() => {
      setInput1(snapshot.input1)
      setInput2(snapshot.input2)
      setFile1(snapshot.file1)
      setFile2(snapshot.file2)
      setFolder1(snapshot.folder1)
      setFolder2(snapshot.folder2)
      setFolderEntries1(snapshot.folderEntries1)
      setFolderEntries2(snapshot.folderEntries2)
      setFolderDiffEntries(snapshot.folderDiffEntries)
      setSelectedFolderPath(snapshot.selectedFolderPath)
      setActiveGroupId(snapshot.activeGroupId)
    })
    runCompare(snapshot.input1, snapshot.input2)
  }

  const handleClearAll = () => {
    setInput1('')
    setInput2('')
    setFile1(null)
    setFile2(null)
    setFolder1(null)
    setFolder2(null)
    setFolderEntries1({})
    setFolderEntries2({})
    setFolderDiffEntries([])
    setSelectedFolderPath(null)
    setDiffResult(null)
    setActiveGroupId(null)
    setUndoStack([])
    setError('')
  }

  const handleFileLoad = async (side: 'first' | 'second', file: File) => {
    setError('')

    if (file.size > MAX_COMPARE_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${formatFileSize(MAX_COMPARE_FILE_SIZE)}.`)
      return
    }

    try {
      const text = (await file.text()).replace(/\r\n/g, '\n')
      const nextMeta = createLoadedFileMeta(file, text)

      startTransition(() => {
        if (side === 'first') {
          setInput1(text)
          setFile1(nextMeta)
        } else {
          setInput2(text)
          setFile2(nextMeta)
        }
        setDiffResult(null)
        setActiveGroupId(null)
        setUndoStack([])
      })
    } catch {
      setError('Could not read this file.')
    }
  }

  const handleFolderLoad = async (side: 'first' | 'second', files: FileList) => {
    setError('')

    try {
      const fileArray = Array.from(files)
      const entriesList = await Promise.all(
        fileArray.map(async (file) => {
          if (file.size > MAX_COMPARE_FILE_SIZE) {
            throw new Error(`File is too large. Maximum size is ${formatFileSize(MAX_COMPARE_FILE_SIZE)}.`)
          }

          const text = (await file.text()).replace(/\r\n/g, '\n')
          const originalPath = file.webkitRelativePath || file.name
          const folderName = originalPath.split('/')[0] || 'Folder'
          const path = originalPath.startsWith(`${folderName}/`) ? originalPath.slice(folderName.length + 1) : file.name

          return [
            path,
            {
              path,
              text,
              size: file.size,
              lineCount: countLines(text),
              lastModified: file.lastModified,
            },
          ] as const
        }),
      )

      const entryMap = Object.fromEntries(entriesList)
      const folderName = fileArray[0]?.webkitRelativePath?.split('/')[0] || 'Folder'
      const folderMeta: LoadedFolderMeta = {
        name: folderName,
        fileCount: fileArray.length,
        totalSize: fileArray.reduce((total, file) => total + file.size, 0),
      }

      startTransition(() => {
        if (side === 'first') {
          setFolder1(folderMeta)
          setFolderEntries1(entryMap)
        } else {
          setFolder2(folderMeta)
          setFolderEntries2(entryMap)
        }
        setDiffResult(null)
        setSelectedFolderPath(null)
        setActiveGroupId(null)
        setUndoStack([])
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not read this folder.')
    }
  }

  const selectFolderDiffEntry = (entry: FolderDiffEntry) => {
    setSelectedFolderPath(entry.path)
    const leftText = entry.left?.text || ''
    const rightText = entry.right?.text || ''
    setInput1(leftText)
    setInput2(rightText)
    setFile1(
      entry.left
        ? {
            name: entry.path,
            size: entry.left.size,
            lineCount: entry.left.lineCount,
            edited: false,
          }
        : null,
    )
    setFile2(
      entry.right
        ? {
            name: entry.path,
            size: entry.right.size,
            lineCount: entry.right.lineCount,
            edited: false,
          }
        : null,
    )
    runCompare(leftText, rightText)
  }

  const selectFolderDiffPath = (path: string) => {
    const entry = folderDiffEntriesByPath[path]
    if (!entry) return
    selectFolderDiffEntry(entry)
  }

  const navigateChange = (direction: 'prev' | 'next') => {
    if (orderedGroupIds.length === 0) return

    if (activeGroupId === null) {
      setActiveGroupId(direction === 'next' ? orderedGroupIds[0] : orderedGroupIds[orderedGroupIds.length - 1])
      return
    }

    const currentIndex = orderedGroupIds.indexOf(activeGroupId)
    if (currentIndex === -1) {
      setActiveGroupId(orderedGroupIds[0])
      return
    }

    const nextIndex =
      direction === 'next'
        ? Math.min(orderedGroupIds.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1)

    setActiveGroupId(orderedGroupIds[nextIndex])
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <ToolsBackButton />
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{t('json.diff.title')}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('json.diff.subtitle')}</p>
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-background/70 p-3 sm:mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => setMode('text')}
                className="min-w-28"
              >
                {t('json.diff.mode-text')}
              </Button>
              <Button
                variant={mode === 'file' ? 'default' : 'outline'}
                onClick={() => setMode('file')}
                className="min-w-28"
              >
                {t('json.diff.mode-file')}
              </Button>
              <Button
                variant={mode === 'folder' ? 'default' : 'outline'}
                onClick={() => setMode('folder')}
                className="min-w-28"
              >
                {t('json.diff.mode-folder')}
              </Button>
            </div>
          </div>

          {mode === 'text' ? (
            <div className="mb-6 grid gap-6 xl:grid-cols-2 xl:gap-8">
              <JsonEditor
                value={input1}
                onChange={(value) => {
                  setInput1(value)
                  setDiffResult(null)
                }}
                label={t('json.diff.first')}
                placeholder={t('json.diff.placeholder-first')}
              />
              <JsonEditor
                value={input2}
                onChange={(value) => {
                  setInput2(value)
                  setDiffResult(null)
                }}
                label={t('json.diff.second')}
                placeholder={t('json.diff.placeholder-second')}
              />
            </div>
          ) : mode === 'file' ? (
            <div className="mb-6 space-y-4 sm:mb-8">
              <div className="rounded-2xl border border-border bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
                {t('json.diff.file-hint')}
                <span className="ml-1 font-medium text-foreground">{t('json.diff.large-files')}</span>
              </div>
              <div className="grid gap-6 xl:grid-cols-2 xl:gap-8">
                <FileCompareCard
                  inputId="first-compare-file"
                  label={t('json.diff.first')}
                  file={file1}
                  value={input1}
                  chooseLabel={t('json.diff.file-choose')}
                  replaceLabel={t('json.diff.file-replace')}
                  clearLabel={t('json.diff.file-clear')}
                  hint={t('json.diff.first')}
                  loadedLabel={t('json.diff.file-ready')}
                  linesLabel={t('json.diff.file-lines')}
                  placeholder={t('json.diff.placeholder-first')}
                  onTextChange={(value) => {
                    setInput1(value)
                    setFile1((current) => updateLoadedFileMeta(current, value))
                    setDiffResult(null)
                  }}
                  onFileChange={(file) => void handleFileLoad('first', file)}
                  onClear={() => {
                    setInput1('')
                    setFile1(null)
                    setDiffResult(null)
                  }}
                />
                <FileCompareCard
                  inputId="second-compare-file"
                  label={t('json.diff.second')}
                  file={file2}
                  value={input2}
                  chooseLabel={t('json.diff.file-choose')}
                  replaceLabel={t('json.diff.file-replace')}
                  clearLabel={t('json.diff.file-clear')}
                  hint={t('json.diff.second')}
                  loadedLabel={t('json.diff.file-ready')}
                  linesLabel={t('json.diff.file-lines')}
                  placeholder={t('json.diff.placeholder-second')}
                  onTextChange={(value) => {
                    setInput2(value)
                    setFile2((current) => updateLoadedFileMeta(current, value))
                    setDiffResult(null)
                  }}
                  onFileChange={(file) => void handleFileLoad('second', file)}
                  onClear={() => {
                    setInput2('')
                    setFile2(null)
                    setDiffResult(null)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 space-y-4 sm:mb-8">
              <div className="rounded-2xl border border-border bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
                {t('json.diff.folder-hint')}
                <span className="ml-1 font-medium text-foreground">{t('json.diff.large-files')}</span>
              </div>
              <div className="grid gap-6 xl:grid-cols-2 xl:gap-8">
                <FolderCompareCard
                  inputId="first-compare-folder"
                  label={t('json.diff.first')}
                  folder={folder1}
                  folderEntries={folderEntries1}
                  diffEntriesByPath={folderDiffEntriesByPath}
                  selectedPath={selectedFolderPath}
                  chooseLabel={t('json.diff.folder-choose')}
                  replaceLabel={t('json.diff.folder-replace')}
                  clearLabel={t('json.diff.folder-clear')}
                  hint={t('json.diff.first')}
                  readyLabel={t('json.diff.folder-ready')}
                  filesLabel={t('json.diff.files-in-folder')}
                  changedLabel={t('json.diff.folder-changed')}
                  addedLabel={t('json.diff.folder-added')}
                  removedLabel={t('json.diff.folder-removed')}
                  unchangedLabel={t('json.diff.folder-unchanged')}
                  onFolderChange={(files) => void handleFolderLoad('first', files)}
                  onSelectPath={selectFolderDiffPath}
                  onClear={() => {
                    setFolder1(null)
                    setFolderEntries1({})
                    setFolderDiffEntries([])
                    setSelectedFolderPath(null)
                    setDiffResult(null)
                  }}
                />
                <FolderCompareCard
                  inputId="second-compare-folder"
                  label={t('json.diff.second')}
                  folder={folder2}
                  folderEntries={folderEntries2}
                  diffEntriesByPath={folderDiffEntriesByPath}
                  selectedPath={selectedFolderPath}
                  chooseLabel={t('json.diff.folder-choose')}
                  replaceLabel={t('json.diff.folder-replace')}
                  clearLabel={t('json.diff.folder-clear')}
                  hint={t('json.diff.second')}
                  readyLabel={t('json.diff.folder-ready')}
                  filesLabel={t('json.diff.files-in-folder')}
                  changedLabel={t('json.diff.folder-changed')}
                  addedLabel={t('json.diff.folder-added')}
                  removedLabel={t('json.diff.folder-removed')}
                  unchangedLabel={t('json.diff.folder-unchanged')}
                  onFolderChange={(files) => void handleFolderLoad('second', files)}
                  onSelectPath={selectFolderDiffPath}
                  onClear={() => {
                    setFolder2(null)
                    setFolderEntries2({})
                    setFolderDiffEntries([])
                    setSelectedFolderPath(null)
                    setDiffResult(null)
                  }}
                />
              </div>
              {folderDiffEntries.length > 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/70 px-5 py-6 text-sm text-muted-foreground">
                  {selectedFolderPath ? selectedFolderPath : t('json.diff.folder-select')}
                </div>
              ) : null}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              onClick={handleCompare}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 sm:w-auto"
              disabled={(mode === 'file' && (!input1 || !input2)) || (mode === 'folder' && (!folder1 || !folder2))}
            >
              {mode === 'file' ? t('json.diff.action-files') : mode === 'folder' ? t('json.diff.action-folders') : t('json.diff.action')}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleClearAll}>
              {t('json.common.clear-all')}
            </Button>
          </div>

          {diffResult ? (
            <section className="rounded-2xl border border-border bg-background shadow-sm">
              <div className="sticky top-18 z-20 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{t('json.diff.output')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {diffResult.changedRows === 0
                      ? t('json.diff.identical')
                      : `${diffResult.changedRows.toLocaleString()} changed row${diffResult.changedRows === 1 ? '' : 's'} across ${diffResult.rows.length.toLocaleString()} compared rows.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {orderedGroupIds.length > 0 ? (
                    <div className="mr-1 flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                      <span>
                        {(activeGroupId ? orderedGroupIds.indexOf(activeGroupId) + 1 : 1).toLocaleString()}/{orderedGroupIds.length.toLocaleString()} {t('json.diff.change-count')}
                      </span>
                      <Button size="icon-sm" variant="ghost" className="h-7 w-7" onClick={() => navigateChange('prev')} title={t('json.diff.prev-change')}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="h-7 w-7" onClick={() => navigateChange('next')} title={t('json.diff.next-change')}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={handleCopyOutput} className="h-8 px-2 sm:px-3">
                    <Copy className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{t('json.common.copy')}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUndoChange}
                    className="h-8 px-2 sm:px-3"
                    disabled={undoStack.length === 0}
                  >
                    <span>{t('json.diff.undo-change')}</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadOutput} className="h-8 px-2 sm:px-3">
                    <Download className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{t('json.common.download')}</span>
                  </Button>
                </div>
              </div>

              <VirtualizedDiffRows
                rows={diffResult.rows}
                groups={changeGroups}
                onApplyToFirst={handleApplyToFirst}
                onApplyToSecond={handleApplyToSecond}
                firstLabel={mode === 'text' ? t('json.diff.first') : file1?.name || selectedFolderPath || t('json.diff.first')}
                secondLabel={mode === 'text' ? t('json.diff.second') : file2?.name || selectedFolderPath || t('json.diff.second')}
                applyToFirstLabel={t('json.diff.apply-to-first')}
                applyToSecondLabel={t('json.diff.apply-to-second')}
                activeGroupId={activeGroupId}
              />
            </section>
          ) : null}

          {error ? (
            <div className="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{t('json.common.error')}</p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          ) : null}

          {diffResult && !error ? (
            <div className="mt-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {diffResult.changedRows === 0 ? t('json.diff.no-differences') : t('json.diff.success')}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

function parseFlexibleJsonInput(jsonString: string): unknown {
  const input = jsonString.trim()
  const attempts: string[] = [input]

  const looksLikePropertyFragment =
    /^"[^"]+"\s*:/.test(input) || /^'[^']+'\s*:/.test(input)

  if (looksLikePropertyFragment) {
    attempts.push(`{${input}}`)
  }

  const decodedInlineEscapes = input
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")

  if (decodedInlineEscapes !== input) {
    attempts.push(decodedInlineEscapes)
    if (looksLikePropertyFragment) {
      attempts.push(`{${decodedInlineEscapes}}`)
    }
  }

  if (
    input &&
    !((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) &&
    /\\[nrt"\\/]/.test(input)
  ) {
    attempts.push(`"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
  }

  let lastError: unknown

  for (const attempt of attempts) {
    try {
      let parsed = JSON.parse(attempt)

      while (typeof parsed === "string") {
        const nested = parsed.trim()
        if (!(nested.startsWith("{") || nested.startsWith("["))) break
        parsed = JSON.parse(nested)
      }

      return parsed
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Invalid JSON")
}

export function parseJsonInput(jsonString: string): unknown {
  return normalizeNestedJsonStrings(parseFlexibleJsonInput(jsonString))
}

function normalizeNestedJsonStrings(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeNestedJsonStrings(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeNestedJsonStrings(nestedValue)]),
    )
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    const looksJsonLike =
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith('"{') ||
      trimmed.startsWith('"[') ||
      /\\[nrt"\\/]/.test(trimmed)

    if (looksJsonLike) {
      try {
        return normalizeNestedJsonStrings(parseFlexibleJsonInput(trimmed))
      } catch {
        return value
      }
    }
  }

  return value
}

function minifyNestedJsonStringsByKey(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => minifyNestedJsonStringsByKey(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, minifyNestedJsonStringsByKey(nestedValue)]),
    )
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    const looksJsonLike =
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith('"{') ||
      trimmed.startsWith('"[') ||
      /\\[nrt"\\/]/.test(trimmed)

    if (looksJsonLike) {
      try {
        const parsed = normalizeNestedJsonStrings(parseFlexibleJsonInput(trimmed))
        return JSON.stringify(parsed)
      } catch {
        return value
      }
    }
  }

  return value
}

export function jsonPretty(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = parseJsonInput(jsonString)
    const pretty = JSON.stringify(parsed, null, 2)
    return { result: pretty, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonMinify(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = minifyNestedJsonStringsByKey(parseFlexibleJsonInput(jsonString))
    const minified = JSON.stringify(parsed)
    return { result: minified, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonFormat(jsonString: string, indent: number = 2): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = parseJsonInput(jsonString)
    const formatted = JSON.stringify(parsed, null, indent)
    return { result: formatted, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonPrettyString(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = parseJsonInput(jsonString)
    let result = ''
    const indent = (level: number) => '  '.repeat(level)

    function stringify(obj: any, level: number = 0): string {
      if (obj === null) return 'null'
      if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`
      if (typeof obj === 'number') return String(obj)
      if (typeof obj === 'boolean') return String(obj)

      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]'
        let str = '[\n'
        obj.forEach((item, index) => {
          str += indent(level + 1) + stringify(item, level + 1)
          if (index < obj.length - 1) str += ','
          str += '\n'
        })
        str += indent(level) + ']'
        return str
      }

      if (typeof obj === 'object') {
        const keys = Object.keys(obj)
        if (keys.length === 0) return '{}'
        let str = '{\n'
        keys.forEach((key, index) => {
          str += indent(level + 1) + `"${key}": ` + stringify(obj[key], level + 1)
          if (index < keys.length - 1) str += ','
          str += '\n'
        })
        str += indent(level) + '}'
        return str
      }

      return String(obj)
    }

    result = stringify(parsed)
    return { result, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export interface JsonDiffRow {
  leftLineNumber: number | null
  rightLineNumber: number | null
  leftContent: string
  rightContent: string
  leftType: 'unchanged' | 'removed' | 'modified' | 'empty'
  rightType: 'unchanged' | 'added' | 'modified' | 'empty'
  changeGroup: number | null
  leftCursor: number
  rightCursor: number
}

export interface JsonDiffResult {
  left: string
  right: string
  rows: JsonDiffRow[]
  changedRows: number
}

function buildLcsMatrix(leftLines: string[], rightLines: string[]) {
  const matrix = Array.from({ length: leftLines.length + 1 }, () => Array<number>(rightLines.length + 1).fill(0))

  for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightLines.length - 1; rightIndex >= 0; rightIndex -= 1) {
      if (leftLines[leftIndex] === rightLines[rightIndex]) {
        matrix[leftIndex][rightIndex] = matrix[leftIndex + 1][rightIndex + 1] + 1
      } else {
        matrix[leftIndex][rightIndex] = Math.max(matrix[leftIndex + 1][rightIndex], matrix[leftIndex][rightIndex + 1])
      }
    }
  }

  return matrix
}

type DiffOperation =
  | { type: 'unchanged'; leftContent: string; rightContent: string }
  | { type: 'removed'; leftContent: string }
  | { type: 'added'; rightContent: string }

const SMALL_DIFF_CELL_LIMIT = 120_000

function buildSmallDiffOperations(leftLines: string[], rightLines: string[]) {
  const matrix = buildLcsMatrix(leftLines, rightLines)
  const operations: DiffOperation[] = []

  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
    if (leftLines[leftIndex] === rightLines[rightIndex]) {
      operations.push({
        type: 'unchanged',
        leftContent: leftLines[leftIndex],
        rightContent: rightLines[rightIndex],
      })
      leftIndex += 1
      rightIndex += 1
      continue
    }

    if (matrix[leftIndex + 1][rightIndex] >= matrix[leftIndex][rightIndex + 1]) {
      operations.push({ type: 'removed', leftContent: leftLines[leftIndex] })
      leftIndex += 1
    } else {
      operations.push({ type: 'added', rightContent: rightLines[rightIndex] })
      rightIndex += 1
    }
  }

  while (leftIndex < leftLines.length) {
    operations.push({ type: 'removed', leftContent: leftLines[leftIndex] })
    leftIndex += 1
  }

  while (rightIndex < rightLines.length) {
    operations.push({ type: 'added', rightContent: rightLines[rightIndex] })
    rightIndex += 1
  }

  return operations
}

function longestIncreasingSubsequence(candidates: Array<{ left: number; right: number }>) {
  if (candidates.length === 0) {
    return []
  }

  const tails: number[] = []
  const previous = new Array<number>(candidates.length).fill(-1)

  for (let index = 0; index < candidates.length; index += 1) {
    const right = candidates[index].right
    let low = 0
    let high = tails.length

    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (candidates[tails[mid]].right < right) {
        low = mid + 1
      } else {
        high = mid
      }
    }

    if (low > 0) {
      previous[index] = tails[low - 1]
    }

    if (low === tails.length) {
      tails.push(index)
    } else {
      tails[low] = index
    }
  }

  const result: Array<{ left: number; right: number }> = []
  let cursor = tails[tails.length - 1]

  while (cursor !== undefined && cursor >= 0) {
    result.push(candidates[cursor])
    cursor = previous[cursor]
  }

  return result.reverse()
}

function findUniqueAnchors(
  leftLines: string[],
  leftStart: number,
  leftEnd: number,
  rightLines: string[],
  rightStart: number,
  rightEnd: number,
) {
  const leftCounts = new Map<string, { count: number; index: number }>()
  const rightCounts = new Map<string, { count: number; index: number }>()

  for (let index = leftStart; index < leftEnd; index += 1) {
    const entry = leftCounts.get(leftLines[index])
    if (entry) {
      entry.count += 1
    } else {
      leftCounts.set(leftLines[index], { count: 1, index })
    }
  }

  for (let index = rightStart; index < rightEnd; index += 1) {
    const entry = rightCounts.get(rightLines[index])
    if (entry) {
      entry.count += 1
    } else {
      rightCounts.set(rightLines[index], { count: 1, index })
    }
  }

  const candidates: Array<{ left: number; right: number }> = []

  for (const [line, leftEntry] of leftCounts.entries()) {
    const rightEntry = rightCounts.get(line)
    if (leftEntry.count === 1 && rightEntry?.count === 1) {
      candidates.push({ left: leftEntry.index, right: rightEntry.index })
    }
  }

  candidates.sort((first, second) => first.left - second.left || first.right - second.right)
  return longestIncreasingSubsequence(candidates)
}

function pushRangeOperations(
  operations: DiffOperation[],
  leftLines: string[],
  leftStart: number,
  leftEnd: number,
  rightLines: string[],
  rightStart: number,
  rightEnd: number,
) {
  for (let index = leftStart; index < leftEnd; index += 1) {
    operations.push({ type: 'removed', leftContent: leftLines[index] })
  }

  for (let index = rightStart; index < rightEnd; index += 1) {
    operations.push({ type: 'added', rightContent: rightLines[index] })
  }
}

function diffLineRanges(
  leftLines: string[],
  leftStart: number,
  leftEnd: number,
  rightLines: string[],
  rightStart: number,
  rightEnd: number,
  operations: DiffOperation[],
): void {
  while (leftStart < leftEnd && rightStart < rightEnd && leftLines[leftStart] === rightLines[rightStart]) {
    operations.push({
      type: 'unchanged',
      leftContent: leftLines[leftStart],
      rightContent: rightLines[rightStart],
    })
    leftStart += 1
    rightStart += 1
  }

  const suffix: DiffOperation[] = []
  while (leftStart < leftEnd && rightStart < rightEnd && leftLines[leftEnd - 1] === rightLines[rightEnd - 1]) {
    suffix.push({
      type: 'unchanged',
      leftContent: leftLines[leftEnd - 1],
      rightContent: rightLines[rightEnd - 1],
    })
    leftEnd -= 1
    rightEnd -= 1
  }

  if (leftStart === leftEnd || rightStart === rightEnd) {
    pushRangeOperations(operations, leftLines, leftStart, leftEnd, rightLines, rightStart, rightEnd)
    operations.push(...suffix.reverse())
    return
  }

  const leftLength = leftEnd - leftStart
  const rightLength = rightEnd - rightStart

  if (leftLength * rightLength <= SMALL_DIFF_CELL_LIMIT) {
    operations.push(...buildSmallDiffOperations(leftLines.slice(leftStart, leftEnd), rightLines.slice(rightStart, rightEnd)))
    operations.push(...suffix.reverse())
    return
  }

  const anchors = findUniqueAnchors(leftLines, leftStart, leftEnd, rightLines, rightStart, rightEnd)

  if (anchors.length === 0) {
    pushRangeOperations(operations, leftLines, leftStart, leftEnd, rightLines, rightStart, rightEnd)
    operations.push(...suffix.reverse())
    return
  }

  let currentLeft = leftStart
  let currentRight = rightStart

  for (const anchor of anchors) {
    diffLineRanges(leftLines, currentLeft, anchor.left, rightLines, currentRight, anchor.right, operations)
    operations.push({
      type: 'unchanged',
      leftContent: leftLines[anchor.left],
      rightContent: rightLines[anchor.right],
    })
    currentLeft = anchor.left + 1
    currentRight = anchor.right + 1
  }

  diffLineRanges(leftLines, currentLeft, leftEnd, rightLines, currentRight, rightEnd, operations)
  operations.push(...suffix.reverse())
}

function buildRawDiffOperations(leftLines: string[], rightLines: string[]) {
  const operations: DiffOperation[] = []
  diffLineRanges(leftLines, 0, leftLines.length, rightLines, 0, rightLines.length, operations)
  return operations
}

function buildJsonDiffRows(leftLines: string[], rightLines: string[]): JsonDiffRow[] {
  const operations = buildRawDiffOperations(leftLines, rightLines)
  const rows: JsonDiffRow[] = []
  let leftLineNumber = 1
  let rightLineNumber = 1
  let index = 0
  let changeGroup = 0

  while (index < operations.length) {
    const operation = operations[index]

    if (operation.type === 'unchanged') {
      rows.push({
        leftLineNumber,
        rightLineNumber,
        leftContent: operation.leftContent,
        rightContent: operation.rightContent,
        leftType: 'unchanged',
        rightType: 'unchanged',
        changeGroup: null,
        leftCursor: leftLineNumber - 1,
        rightCursor: rightLineNumber - 1,
      })
      leftLineNumber += 1
      rightLineNumber += 1
      index += 1
      continue
    }

    const removedBlock: string[] = []
    const addedBlock: string[] = []

    while (index < operations.length && operations[index].type !== 'unchanged') {
      const current = operations[index]
      if (current.type === 'removed') {
        removedBlock.push(current.leftContent)
      } else if (current.type === 'added') {
        addedBlock.push(current.rightContent)
      }
      index += 1
    }

    changeGroup += 1
    const sharedLength = Math.min(removedBlock.length, addedBlock.length)

    for (let pairIndex = 0; pairIndex < sharedLength; pairIndex += 1) {
      rows.push({
        leftLineNumber,
        rightLineNumber,
        leftContent: removedBlock[pairIndex],
        rightContent: addedBlock[pairIndex],
        leftType: 'modified',
        rightType: 'modified',
        changeGroup,
        leftCursor: leftLineNumber - 1,
        rightCursor: rightLineNumber - 1,
      })
      leftLineNumber += 1
      rightLineNumber += 1
    }

    for (let removedIndex = sharedLength; removedIndex < removedBlock.length; removedIndex += 1) {
      rows.push({
        leftLineNumber,
        rightLineNumber: null,
        leftContent: removedBlock[removedIndex],
        rightContent: '',
        leftType: 'removed',
        rightType: 'empty',
        changeGroup,
        leftCursor: leftLineNumber - 1,
        rightCursor: rightLineNumber - 1,
      })
      leftLineNumber += 1
    }

    for (let addedIndex = sharedLength; addedIndex < addedBlock.length; addedIndex += 1) {
      rows.push({
        leftLineNumber: null,
        rightLineNumber,
        leftContent: '',
        rightContent: addedBlock[addedIndex],
        leftType: 'empty',
        rightType: 'added',
        changeGroup,
        leftCursor: leftLineNumber - 1,
        rightCursor: rightLineNumber - 1,
      })
      rightLineNumber += 1
    }
  }

  return rows
}

export function jsonDiff(json1: string, json2: string): { result: JsonDiffResult; error: null } | { result: null; error: string } {
  try {
    const left = json1.replace(/\r\n/g, '\n')
    const right = json2.replace(/\r\n/g, '\n')
    const rows = buildJsonDiffRows(left.split('\n'), right.split('\n'))
    const changedRows = rows.filter((row) => row.changeGroup !== null).length

    return {
      result: {
        left,
        right,
        rows,
        changedRows,
      },
      error: null,
    }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function validateJSON(jsonString: string): { valid: boolean; error: string | null } {
  try {
    parseFlexibleJsonInput(jsonString)
    return { valid: true, error: null }
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

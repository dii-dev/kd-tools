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
    const parsed = normalizeNestedJsonStrings(parseFlexibleJsonInput(jsonString))
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
    const parsed = normalizeNestedJsonStrings(parseFlexibleJsonInput(jsonString))
    const formatted = JSON.stringify(parsed, null, indent)
    return { result: formatted, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonPrettyString(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = normalizeNestedJsonStrings(parseFlexibleJsonInput(jsonString))
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

export function jsonDiff(json1: string, json2: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const obj1 = normalizeNestedJsonStrings(parseFlexibleJsonInput(json1))
    const obj2 = normalizeNestedJsonStrings(parseFlexibleJsonInput(json2))

    const changes: string[] = []

    function compareObjects(left: any, right: any, path: string = 'root'): void {
      const allKeys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})])

      allKeys.forEach((key) => {
        const leftVal = left?.[key]
        const rightVal = right?.[key]
        const currentPath = path ? `${path}.${key}` : key

        if (JSON.stringify(leftVal) !== JSON.stringify(rightVal)) {
          if (typeof leftVal === 'object' && typeof rightVal === 'object' && leftVal !== null && rightVal !== null) {
            compareObjects(leftVal, rightVal, currentPath)
          } else {
            changes.push(`+ ${currentPath}: ${JSON.stringify(rightVal)}`)
            if (leftVal !== undefined) {
              changes.push(`- ${currentPath}: ${JSON.stringify(leftVal)}`)
            }
          }
        }
      })
    }

    compareObjects(obj1, obj2)

    const result = changes.length > 0 ? changes.join('\n') : 'No differences found'
    return { result, error: null }
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

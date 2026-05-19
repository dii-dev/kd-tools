export function jsonPretty(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
    const pretty = JSON.stringify(parsed, null, 2)
    return { result: pretty, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonMinify(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
    const minified = JSON.stringify(parsed)
    return { result: minified, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonFormat(jsonString: string, indent: number = 2): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
    const formatted = JSON.stringify(parsed, null, indent)
    return { result: formatted, error: null }
  } catch (err) {
    return { result: null, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

export function jsonPrettyString(jsonString: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
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
    const obj1 = JSON.parse(json1)
    const obj2 = JSON.parse(json2)

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
    JSON.parse(jsonString)
    return { valid: true, error: null }
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
  }
}

function escapeAttributeValue(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function buildSafeXml(input: string) {
  const trimmed = input.trim()

  if (/^<\?xml[\s\S]*\?>/.test(trimmed) || /^<[^>]+>/.test(trimmed)) {
    return trimmed
  }

  const looksLikePropertyFragment = /^"[^"]+"\s*:/.test(trimmed) || /^'[^']+'\s*:/.test(trimmed)
  const candidate = looksLikePropertyFragment ? `{${trimmed}}` : trimmed

  try {
    const parsed = JSON.parse(candidate)
    const xmlText =
      typeof parsed === "string"
        ? parsed
        : typeof parsed === "object" && parsed !== null && typeof (parsed as Record<string, unknown>).responseObj === "string"
          ? String((parsed as Record<string, unknown>).responseObj)
          : ""

    return xmlText.trim()
  } catch {
    return trimmed
  }
}

function elementToJson(node: Element): unknown {
  const attributes = Array.from(node.attributes)
  const childElements = Array.from(node.children)
  const textContent = Array.from(node.childNodes)
    .filter((child) => child.nodeType === Node.TEXT_NODE)
    .map((child) => child.textContent?.trim() || "")
    .join("")
    .trim()

  if (childElements.length === 0 && attributes.length === 0) {
    return textContent
  }

  const result: Record<string, unknown> = {}

  if (attributes.length > 0) {
    result["@attributes"] = Object.fromEntries(
      attributes.map((attribute) => [attribute.name, attribute.value]),
    )
  }

  if (childElements.length > 0) {
    const groupedChildren = new Map<string, unknown[]>()

    childElements.forEach((child) => {
      const current = groupedChildren.get(child.tagName) || []
      current.push(elementToJson(child))
      groupedChildren.set(child.tagName, current)
    })

    groupedChildren.forEach((values, key) => {
      result[key] = values.length === 1 ? values[0] : values
    })
  }

  if (textContent) {
    result["#text"] = textContent
  }

  return result
}

export function xmlToJson(input: string): { result: string | null; error: string | null } {
  try {
    const xml = buildSafeXml(input)
    if (!xml) {
      return { result: null, error: "Please enter XML or SOAP content." }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, "application/xml")
    const parserError = doc.querySelector("parsererror")

    if (parserError) {
      return { result: null, error: "Invalid XML or SOAP format." }
    }

    const root = doc.documentElement
    const json = {
      [root.tagName]: elementToJson(root),
    }

    return { result: JSON.stringify(json, null, 2), error: null }
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : "Failed to convert XML to JSON.",
    }
  }
}

export function soapToJson(input: string): { result: string | null; error: string | null } {
  return xmlToJson(input)
}

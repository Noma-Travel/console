import type { ReactNode } from "react"

/** Minimal blueprint shape for rich labels (matches ItemPreview / CRUD probes). */
export type BlueprintFieldDisplaySource = {
  rich?: Record<string, Record<string, string>>
  sources?: Record<string, string>
}

/**
 * Renders a stored field value for read-only preview: objects/arrays as JSON blocks,
 * optional `rich` lookup for primitive IDs, long or JSON-like strings as monospace blocks.
 * Same behavior as the “Fields” column in ItemPreview.
 */
export function formatBlueprintFieldValue(
  value: unknown,
  key: string,
  blueprint?: BlueprintFieldDisplaySource,
): ReactNode {
  if (value === undefined) {
    return <span className="text-muted-foreground">—</span>
  }
  if (value !== null && typeof value === "object") {
    return (
      <pre className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }

  const richRing = blueprint?.sources?.[key]?.split(":")[0]
  const resolved =
    richRing != null && blueprint?.rich?.[richRing]
      ? blueprint.rich[richRing][String(value)] ?? value
      : value

  const text = String(resolved)
  const trim = text.trim()
  const looksLikeJson =
    (trim.startsWith("{") && trim.endsWith("}")) ||
    (trim.startsWith("[") && trim.endsWith("]"))
  const isLong = text.length > 200

  if (looksLikeJson || isLong) {
    return (
      <pre className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
        {text}
      </pre>
    )
  }

  return (
    <span className="break-words [overflow-wrap:anywhere]">{text}</span>
  )
}

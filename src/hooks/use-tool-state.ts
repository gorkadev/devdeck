import * as React from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"

import {
  URL_VALUE_MAX_LENGTH,
  readStored,
  writeStored,
  type Parser,
} from "@/lib/tool-state"

type Navigate = ReturnType<typeof useNavigate>
type SearchRecord = Record<string, unknown>

interface ToolStateOptions<T> {
  /** Validates values coming from the URL or from a previous session. */
  parse: Parser<T>
  /** Read the value from, and mirror it into, the URL search params. */
  url?: boolean
  /** Restore the value from localStorage on the next visit. */
  persist?: boolean
}

// Several hooks write to the URL in the same tick (on mount every tool mirrors
// its restored state). Separate `navigate` calls would each start from the same
// stale location and overwrite one another, so patches are merged and applied
// in a single replace navigation.
const pendingPatch = new Map<string, unknown>()
let flushScheduled = false

function patchSearch(navigate: Navigate, key: string, value: unknown) {
  pendingPatch.set(key, value)
  if (flushScheduled) return
  flushScheduled = true
  queueMicrotask(() => {
    flushScheduled = false
    const patch = new Map(pendingPatch)
    pendingPatch.clear()
    navigate({
      search: ((prev: SearchRecord) => {
        const next: SearchRecord = { ...prev }
        for (const [k, v] of patch) {
          if (v === undefined) delete next[k]
          else next[k] = v
        }
        return next
      }) as never,
      replace: true,
    })
  })
}

function toURLValue<T>(value: T, fallback: T): T | undefined {
  // Defaults stay out of the URL so links remain short, and long text never
  // goes there: it would hit URL length limits and end up in server logs.
  if (Object.is(value, fallback)) return undefined
  if (typeof value === "string" && value.length > URL_VALUE_MAX_LENGTH) return undefined
  return value
}

/**
 * State for one tool setting. Precedence on mount: a valid URL param (a shared
 * link), then the value saved from the last visit, then `fallback`.
 *
 * - `url: false` keeps the value out of the URL, and strips the param if an old
 *   link still carries it. Use it for secrets.
 * - `persist: false` keeps the value only for the current visit. Use it for
 *   anything sensitive (passwords, tokens, signing keys).
 */
export function useToolState<T>(
  tool: string,
  key: string,
  fallback: T,
  { parse, url = true, persist = true }: ToolStateOptions<T>
) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SearchRecord
  const storageKey = `${tool}.${key}`

  const [value, setValueState] = React.useState<T>(() => {
    if (url) {
      const fromURL = parse(search[key])
      if (fromURL !== undefined) return fromURL
    }
    if (persist) {
      const fromStorage = parse(readStored(storageKey))
      if (fromStorage !== undefined) return fromStorage
    }
    return fallback
  })

  const latest = React.useRef({ fallback, navigate })
  React.useEffect(() => {
    latest.current = { fallback, navigate }
  })

  // On mount, make the URL describe the state actually shown: restored values
  // appear, invalid ones are replaced, and params that must not live in the URL
  // are removed.
  React.useEffect(() => {
    const current = url ? toURLValue(value, fallback) : undefined
    if (current !== search[key]) patchSearch(navigate, key, current)
    // Mount-only by design: later changes go through `setValue`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setValue = React.useCallback(
    (next: T) => {
      setValueState(next)
      if (persist) writeStored(storageKey, next)
      if (url) patchSearch(latest.current.navigate, key, toURLValue(next, latest.current.fallback))
    },
    [key, persist, storageKey, url]
  )

  return [value, setValue] as const
}

import * as React from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"

/**
 * A controlled value whose state lives in the URL as a search param (shared /
 * shareable tool config, per ADR-0003). TanStack Router already round-trips
 * search values through JSON, so writing the raw value keeps booleans/numbers
 * intact and a shared link restores the exact state on a fresh visit. Changes
 * replace the current history entry so a tool session keeps one URL.
 */
export function useURLSync<T>(param: string, fallback: T) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const [touched, setTouched] = React.useState(false)
  const [draft, setDraft] = React.useState<T>(fallback)

  // The user's current input wins once they type; until then the URL is the
  // source so a shared link restores its state on a fresh visit.
  const value: T = touched
    ? draft
    : (search[param] as T) === undefined
      ? fallback
      : (search[param] as T)

  const setValue = React.useCallback(
    (next: T) => {
      setTouched(true)
      setDraft(next)
      navigate({
        search: (prev) => ({ ...prev, [param]: next }),
        replace: true,
      })
    },
    [navigate, param]
  )

  return [value, setValue] as const
}

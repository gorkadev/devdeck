/**
 * Validation and storage primitives behind `useToolState`.
 *
 * Every value that enters a tool from the outside (a shared URL or a previous
 * session in localStorage) goes through a `Parser`. A parser returns
 * `undefined` for anything it does not accept, so a hand-crafted link such as
 * `?qty=99999999` or `?input=123` (TanStack Router JSON-parses search values,
 * so that arrives as a number) falls back to a safe value instead of freezing
 * or crashing the tool.
 */

export type Parser<T> = (raw: unknown) => T | undefined

/** Longest string a tool writes back into the URL; longer input stays local. */
export const URL_VALUE_MAX_LENGTH = 2_000

/** Longest serialized value kept in localStorage per key (~200 KB). */
export const STORED_VALUE_MAX_LENGTH = 200_000

const STORAGE_PREFIX = "devdeck:v1:"

export const parsers = {
  string(maxLength = STORED_VALUE_MAX_LENGTH): Parser<string> {
    return (raw) => {
      let value: string | undefined
      if (typeof raw === "string") value = raw
      else if (typeof raw === "number" || typeof raw === "boolean") value = String(raw)
      else if (raw !== null && typeof raw === "object") {
        try {
          value = JSON.stringify(raw)
        } catch {
          value = undefined
        }
      }
      return value !== undefined && value.length <= maxLength ? value : undefined
    }
  },

  int(min: number, max: number): Parser<number> {
    return (raw) => {
      const value = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw
      return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
        ? value
        : undefined
    }
  },

  boolean(): Parser<boolean> {
    return (raw) => {
      if (raw === true || raw === "true") return true
      if (raw === false || raw === "false") return false
      return undefined
    }
  },

  oneOf<const T extends string | number>(values: readonly T[]): Parser<T> {
    return (raw) => values.find((value) => String(value) === String(raw))
  },
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    // Access throws when storage is blocked (privacy mode, sandboxed iframes).
    return null
  }
}

export function readStored(key: string): unknown {
  const raw = storage()?.getItem(STORAGE_PREFIX + key)
  if (raw == null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function writeStored(key: string, value: unknown) {
  const store = storage()
  if (!store) return
  try {
    const serialized = JSON.stringify(value)
    if (serialized === undefined || serialized.length > STORED_VALUE_MAX_LENGTH) {
      store.removeItem(STORAGE_PREFIX + key)
    } else {
      store.setItem(STORAGE_PREFIX + key, serialized)
    }
  } catch {
    // Quota exceeded: keep the previous value rather than failing the edit.
  }
}

export function removeStored(key: string) {
  storage()?.removeItem(STORAGE_PREFIX + key)
}

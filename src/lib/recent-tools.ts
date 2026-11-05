import * as React from "react"

import { readStored, writeStored } from "@/lib/tool-state"
import { TOOLS, type ToolInfo } from "@/lib/tools"

const STORAGE_KEY = "recent-tools"
const MAX_RECENT = 4

const listeners = new Set<() => void>()
let cache: ToolInfo[] | null = null

function load(): ToolInfo[] {
  const raw = readStored(STORAGE_KEY)
  if (!Array.isArray(raw)) return []
  // Only known tool URLs survive, so a tampered entry can never become a link.
  return raw
    .map((url) => TOOLS.find((tool) => tool.url === url))
    .filter((tool): tool is ToolInfo => tool !== undefined)
    .slice(0, MAX_RECENT)
}

function getSnapshot() {
  cache ??= load()
  return cache
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function recordToolVisit(tool: ToolInfo) {
  const current = getSnapshot()
  if (current[0]?.url === tool.url) return
  cache = [tool, ...current.filter((t) => t.url !== tool.url)].slice(0, MAX_RECENT)
  writeStored(
    STORAGE_KEY,
    cache.map((t) => t.url)
  )
  listeners.forEach((listener) => listener())
}

/** Tools the visitor opened most recently, newest first. */
export function useRecentTools() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

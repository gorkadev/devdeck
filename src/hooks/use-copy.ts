import * as React from "react"
import { toast } from "@/components/ui/toast"

/**
 * Clipboard write with consistent success/error feedback. Returns whether the
 * write succeeded so callers can branch if they need to. Empty text is a no-op.
 */
export function useCopy() {
  return React.useCallback(async (text: string, description: string) => {
    if (!text) return false
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ type: "success", title: "Copiado", description })
      return true
    } catch {
      toast.add({ type: "error", title: "Error", description: "No se pudo copiar al portapapeles." })
      return false
    }
  }, [])
}

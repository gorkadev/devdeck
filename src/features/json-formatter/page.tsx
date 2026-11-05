import * as React from "react"
import { CopyIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CodeEditor } from "@/components/shared/code-editor"
import { useCopy } from "@/hooks/use-copy"
import { useURLSync } from "@/hooks/use-url-sync"

export function JsonFormatterPage() {
  const copy = useCopy()
  const [rawInput, setRawInput] = useURLSync<string>("input", "")
  const [indentSize, setIndentSize] = useURLSync<number>("indent", 2)

  let parseError: string | null = null
  let formattedOutput = ""

  if (rawInput.trim()) {
    try {
      const parsed = JSON.parse(rawInput)
      formattedOutput = JSON.stringify(parsed, null, indentSize)
    } catch (error) {
      if (error instanceof Error) {
        parseError = error.message
      } else {
        parseError = "Invalid JSON"
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
          <p className="text-muted-foreground text-sm">
            Formatea y valida tu código JSON en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Indentación:</span>
            <ToggleGroup
              value={[indentSize.toString()]}
              onValueChange={(v: string[]) => {
                if (v.length > 0) setIndentSize(parseInt(v[0], 10))
              }}
            >
              <ToggleGroupItem value="2">2 esp</ToggleGroupItem>
              <ToggleGroupItem value="4">4 esp</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button onClick={() => copy(formattedOutput, "JSON copiado al portapapeles.")} variant="secondary" disabled={!formattedOutput}>
            <CopyIcon data-icon="inline-start" />
            Copiar output
          </Button>
        </div>
      </div>

      {/* Editors Grid */}
      <div className="grid h-full gap-6 md:grid-cols-2">
        {/* Input Column */}
        <div className="flex min-h-0 flex-col gap-2">
          <CodeEditor
            value={rawInput}
            onChange={setRawInput}
            className="flex-1"
          />
          {parseError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <TriangleAlertIcon className="size-4 shrink-0" />
              <p className="font-medium break-all">{parseError}</p>
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="flex min-h-0 flex-col">
          <CodeEditor
            value={formattedOutput}
            readOnly
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

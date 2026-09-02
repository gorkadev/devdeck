import * as React from "react"
import { CopyIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CodeEditor } from "@/components/shared/code-editor"

export function JsonFormatterPage() {
  const [rawInput, setRawInput] = React.useState("")
  const [indentSize, setIndentSize] = React.useState<number>(2)

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

  const copyToClipboard = React.useCallback(async () => {
    if (!formattedOutput) return
    await navigator.clipboard.writeText(formattedOutput)
    toast.add({
      type: "success",
      title: "Copiado",
      description: "JSON copiado al portapapeles.",
    })
  }, [formattedOutput])

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Header and Toolbar */}
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
              defaultValue={["2"]}
              onValueChange={(v: string[]) => {
                if (v.length > 0) setIndentSize(parseInt(v[0], 10))
              }}
            >
              <ToggleGroupItem value="2">2 esp</ToggleGroupItem>
              <ToggleGroupItem value="4">4 esp</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button onClick={copyToClipboard} variant="secondary" disabled={!formattedOutput}>
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

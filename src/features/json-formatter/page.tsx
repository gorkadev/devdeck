import * as React from "react"
import { CheckCircle2Icon, CopyIcon, EraserIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CodeEditor } from "@/components/shared/code-editor"
import { ToolHeader } from "@/components/shared/tool-header"
import { useCopy } from "@/hooks/use-copy"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "json-formatter"

/** 0 means minified output. */
const INDENT_OPTIONS = [2, 4, 0] as const
type Indent = (typeof INDENT_OPTIONS)[number]

const SAMPLE = JSON.stringify({
  name: "DevDeck",
  version: "1.0.0",
  private: true,
  tools: ["json-formatter", "jwt-decoder", "uuid-generator"],
  author: { name: "Ada Lovelace", email: "ada@example.com" },
})

function formatJson(input: string, indent: Indent) {
  if (!input.trim()) return { output: "", error: null }
  try {
    return { output: JSON.stringify(JSON.parse(input), null, indent), error: null }
  } catch (error) {
    return { output: "", error: error instanceof Error ? error.message : "JSON inválido" }
  }
}

export function JsonFormatterPage() {
  const copy = useCopy()
  const [rawInput, setRawInput] = useToolState(TOOL, "input", "", { parse: parsers.string() })
  const [indent, setIndent] = useToolState<Indent>(TOOL, "indent", 2, {
    parse: parsers.oneOf(INDENT_OPTIONS),
  })

  const { output, error } = React.useMemo(() => formatJson(rawInput, indent), [rawInput, indent])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ToolHeader
        url="/json-formatter"
        actions={
          <>
            <ToggleGroup
              variant="outline"
              size="sm"
              aria-label="Indentación"
              value={[String(indent)]}
              onValueChange={(v: string[]) => {
                if (v.length > 0) setIndent(Number(v[0]) as Indent)
              }}
            >
              <ToggleGroupItem value="2">2 espacios</ToggleGroupItem>
              <ToggleGroupItem value="4">4 espacios</ToggleGroupItem>
              <ToggleGroupItem value="0">Minificar</ToggleGroupItem>
            </ToggleGroup>
            <Button
              size="sm"
              onClick={() => copy(output, "JSON copiado al portapapeles.")}
              disabled={!output}
            >
              <CopyIcon data-icon="inline-start" />
              Copiar
            </Button>
          </>
        }
      />

      <div className="grid flex-1 gap-4 md:min-h-[28rem] md:grid-cols-2">
        <EditorPanel
          title="Entrada"
          aside={
            <>
              <Button variant="ghost" size="xs" onClick={() => setRawInput(SAMPLE)}>
                <SparklesIcon data-icon="inline-start" />
                Ejemplo
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setRawInput("")} disabled={!rawInput}>
                <EraserIcon data-icon="inline-start" />
                Limpiar
              </Button>
            </>
          }
        >
          <CodeEditor
            value={rawInput}
            onChange={setRawInput}
            placeholder="Pega aquí tu JSON..."
            className="min-h-72 flex-1"
            aria-label="JSON de entrada"
          />
        </EditorPanel>

        <EditorPanel
          title="Resultado"
          aside={
            error ? (
              <Badge variant="destructive">
                <TriangleAlertIcon data-icon="inline-start" />
                Inválido
              </Badge>
            ) : output ? (
              <Badge variant="secondary">
                <CheckCircle2Icon data-icon="inline-start" />
                JSON válido
              </Badge>
            ) : null
          }
        >
          {error ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>No se pudo interpretar el JSON</AlertTitle>
              <AlertDescription className="break-all">{error}</AlertDescription>
            </Alert>
          ) : (
            <CodeEditor value={output} readOnly className="min-h-72 flex-1" aria-label="JSON formateado" />
          )}
        </EditorPanel>
      </div>
    </div>
  )
}

function EditorPanel({
  title,
  aside,
  children,
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-0 flex-col gap-2">
      <div className="flex h-7 items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className="flex items-center gap-1">{aside}</div>
      </div>
      {children}
    </section>
  )
}

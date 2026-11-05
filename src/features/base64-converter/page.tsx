import * as React from "react"
import { ArrowDownUpIcon, CopyIcon, EraserIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ToolHeader } from "@/components/shared/tool-header"
import { useCopy } from "@/hooks/use-copy"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "base64-converter"
const MODES = ["encode", "decode"] as const
type Mode = (typeof MODES)[number]

type Result = { ok: true; text: string } | { ok: false; error: string }

function bytesToBinary(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return binary
}

function encodeBase64(text: string, urlSafe: boolean): Result {
  const base64 = btoa(bytesToBinary(new TextEncoder().encode(text)))
  return {
    ok: true,
    text: urlSafe ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64,
  }
}

function decodeBase64(input: string): Result {
  // Accept both alphabets and missing padding: users paste whatever they have.
  let base64 = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  if (base64.length % 4 === 1) return { ok: false, error: "La longitud no corresponde a Base64." }
  while (base64.length % 4) base64 += "="
  try {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof TypeError
          ? "El contenido decodificado no es texto UTF-8 (probablemente datos binarios)."
          : "Contiene caracteres que no pertenecen a Base64.",
    }
  }
}

export function Base64ConverterPage() {
  const copy = useCopy()
  const [mode, setMode] = useToolState<Mode>(TOOL, "mode", "encode", { parse: parsers.oneOf(MODES) })
  const [urlSafe, setUrlSafe] = useToolState(TOOL, "urlsafe", false, { parse: parsers.boolean() })
  const [input, setInput] = useToolState(TOOL, "input", "", { parse: parsers.string() })

  const result = React.useMemo<Result>(() => {
    if (!input) return { ok: true, text: "" }
    return mode === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input)
  }, [input, mode, urlSafe])

  const output = result.ok ? result.text : ""
  const inputBytes = React.useMemo(() => new TextEncoder().encode(input).length, [input])

  const handleSwap = () => {
    if (!result.ok) return
    setInput(output)
    setMode(mode === "encode" ? "decode" : "encode")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ToolHeader
        url="/base64-converter"
        description="Codifica y decodifica texto en Base64. Soporta UTF-8 y el formato URL-safe."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <ToggleGroup
            variant="outline"
            aria-label="Modo"
            value={[mode]}
            onValueChange={(v: string[]) => {
              if (v.length > 0) setMode(v[0] as Mode)
            }}
          >
            <ToggleGroupItem value="encode">Codificar</ToggleGroupItem>
            <ToggleGroupItem value="decode">Decodificar</ToggleGroupItem>
          </ToggleGroup>
          <Field orientation="horizontal" className="w-auto" data-disabled={mode === "decode" || undefined}>
            <Switch
              id="urlsafe-switch"
              checked={urlSafe}
              onCheckedChange={setUrlSafe}
              disabled={mode === "decode"}
            />
            <FieldLabel htmlFor="urlsafe-switch" className="whitespace-nowrap">
              URL-safe
            </FieldLabel>
          </Field>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleSwap} disabled={!result.ok || !output}>
            <ArrowDownUpIcon data-icon="inline-start" />
            Intercambiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("encode")
              setInput("¡Hola, DevDeck! 👋")
            }}
          >
            <SparklesIcon data-icon="inline-start" />
            Ejemplo
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
            <EraserIcon data-icon="inline-start" />
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entrada</CardTitle>
            <CardDescription>
              {mode === "encode" ? "Texto a codificar." : "Base64 a decodificar."}
            </CardDescription>
            {input && (
              <CardAction>
                <Badge variant="secondary">{inputBytes} bytes</Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Escribe o pega el texto..." : "Pega el Base64..."}
              aria-label="Entrada"
              spellCheck={false}
              className="h-64 resize-none font-mono text-sm md:h-80"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salida</CardTitle>
            <CardDescription>
              {mode === "encode" ? "Resultado en Base64." : "Texto decodificado."}
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copiar resultado"
                onClick={() => copy(output, "Resultado copiado al portapapeles.")}
                disabled={!output}
              >
                <CopyIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {result.ok ? (
              <Textarea
                value={output}
                readOnly
                placeholder="El resultado aparecerá aquí..."
                aria-label="Salida"
                className="h-64 resize-none font-mono text-sm break-all md:h-80"
              />
            ) : (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>Base64 inválido</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

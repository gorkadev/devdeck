import * as React from "react"
import { CopyIcon, ArrowRightLeft } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Field, FieldLabel } from "@/components/ui/field"

// Utils para soportar UTF-8 en Base64
function encodeBase64(str: string, urlSafe: boolean): string {
  try {
    const bytes = new TextEncoder().encode(str)
    const binaryString = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    let base64 = btoa(binaryString)

    if (urlSafe) {
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    return base64
  } catch (e) {
    return "Error: " + (e as Error).message
  }
}

function decodeBase64(str: string, urlSafe: boolean): string {
  try {
    let base64 = str.trim()

    if (urlSafe) {
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/')
      // Añadir padding omitido
      while (base64.length % 4) {
        base64 += '='
      }
    }

    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new TextDecoder().decode(bytes)
  } catch {
    return "Error: Cadena Base64 inválida."
  }
}

type Mode = "encode" | "decode"

export function Base64ConverterPage() {
  const [mode, setMode] = React.useState<Mode>("encode")
  const [urlSafe, setUrlSafe] = React.useState(false)

  const [inputText, setInputText] = React.useState("")
  const [outputText, setOutputText] = React.useState("")

  // Recalcular salida cuando cambia la entrada, el modo o urlSafe
  React.useEffect(() => {
    if (!inputText) {
      setOutputText("")
      return
    }

    if (mode === "encode") {
      setOutputText(encodeBase64(inputText, urlSafe))
    } else {
      setOutputText(decodeBase64(inputText, urlSafe))
    }
  }, [inputText, mode, urlSafe])

  const handleSwap = () => {
    // Si queremos intercambiar entrada y salida:
    const prevOut = outputText
    const prevMode = mode

    // Si había error, no intercambiar un mensaje de error
    if (prevOut.startsWith("Error:")) return

    setInputText(prevOut)
    setMode(prevMode === "encode" ? "decode" : "encode")
  }

  const copyToClipboard = async () => {
    if (!outputText || outputText.startsWith("Error:")) return
    await navigator.clipboard.writeText(outputText)
    toast.add({ type: "success", title: "Copiado", description: "Resultado copiado al portapapeles." })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Base64 Encoder & Decoder</h1>
        <p className="text-muted-foreground text-sm">
          Codifica y decodifica texto plano en Base64. Soporta caracteres especiales (UTF-8) y formato URL-safe.
        </p>
      </div>

      {/* TOP CONTROLS */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          {/* Left section: Toggle + URL Safe */}
          <div className="flex-1 flex flex-row items-center gap-6 justify-start">
            <ToggleGroup
              value={[mode]}
              onValueChange={(v: string[]) => { if (v.length > 0) setMode(v[0] as Mode) }}
              className="justify-start"
            >
              <ToggleGroupItem value="encode" className="px-4">Encode</ToggleGroupItem>
              <ToggleGroupItem value="decode" className="px-4">Decode</ToggleGroupItem>
            </ToggleGroup>

            <Field orientation="horizontal">
              <Switch
                id="urlsafe-switch"
                checked={urlSafe}
                onCheckedChange={setUrlSafe}
              />
              <FieldLabel htmlFor="urlsafe-switch">
                URL-safe
              </FieldLabel>
            </Field>
          </div>

          {/* Middle section: Swap */}
          <div className="flex flex-row items-center justify-center">
            <Button variant="secondary" onClick={handleSwap}>
              <ArrowRightLeft data-icon="inline-start" className="size-4" />
              Swap
            </Button>
          </div>

          {/* Right section: Load Sample + Clear */}
          <div className="flex-1 flex flex-row items-center gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setMode("encode")
                setInputText("Hello DevDeck!")
              }}
            >
              Load sample
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setInputText("")}
              disabled={!inputText}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2-COLUMN GRID */}
      <div className="grid gap-6 md:grid-cols-2" style={{ gridAutoRows: "1fr" }}>

        {/* LEFT CARD: Input */}
        <Card className="flex flex-col min-h-115">
          <CardHeader className="shrink-0 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle>Entrada</CardTitle>
              <CardDescription>
                {mode === "encode" ? "Introduce el texto a codificar." : "Introduce el Base64 a decodificar."}
              </CardDescription>
            </div>
            {inputText && mode === "encode" && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {new TextEncoder().encode(inputText).length} bytes
              </span>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden gap-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === "encode" ? "Introduce el texto aquí..." : "Paste Base64 to decode..."}
              className="my-1 flex-1 resize-none font-mono text-sm overflow-y-auto"
            />
          </CardContent>
        </Card>

        {/* RIGHT CARD: Output */}
        <Card className="flex flex-col min-h-115">
          <CardHeader className="shrink-0 flex flex-row justify-between items-center space-y-0">
            <div>
              <CardTitle>Salida</CardTitle>
              <CardDescription>
                {mode === "encode" ? "Resultado en formato Base64." : "Texto decodificado."}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!outputText || outputText.startsWith("Error:")}>
              <CopyIcon className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden gap-6">
            <Textarea
              value={outputText}
              readOnly
              placeholder="El resultado aparecerá aquí..."
              className={`my-1 flex-1 resize-none font-mono text-sm overflow-y-auto ${outputText.startsWith("Error:") ? "text-destructive" : ""}`}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

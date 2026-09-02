import * as React from "react"
import { v1 as uuidv1, v4 as uuidv4, v6 as uuidv6, v7 as uuidv7 } from "uuid"
import { CopyIcon, RefreshCwIcon } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field"
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type UuidVersion = "v1" | "v4" | "v6" | "v7"
type QuoteType = "none" | "single" | "double"

const VERSION_OPTIONS: { value: UuidVersion; label: string; description: string }[] = [
  { value: "v1", label: "v1", description: "Time-based" },
  { value: "v4", label: "v4", description: "Random (más común)" },
  { value: "v6", label: "v6", description: "Reordered time" },
  { value: "v7", label: "v7", description: "Unix Epoch time" },
]

const QUOTE_OPTIONS: { value: QuoteType; label: string }[] = [
  { value: "none", label: "Ninguna" },
  { value: "single", label: "Simples ('')" },
  { value: "double", label: 'Dobles ("")' },
]

export function UuidGeneratorPage() {
  const [version, setVersion] = React.useState<UuidVersion>("v4")
  const [quantity, setQuantity] = React.useState("1")
  const [hyphens, setHyphens] = React.useState(true)
  const [uppercase, setUppercase] = React.useState(false)
  const [quoteType, setQuoteType] = React.useState<QuoteType>("none")
  const [rawUuids, setRawUuids] = React.useState<string[]>([])

  const selectedVersionLabel = VERSION_OPTIONS.find((v) => v.value === version)
  const selectedQuoteLabel = QUOTE_OPTIONS.find((q) => q.value === quoteType)

  const generateUuids = React.useCallback(() => {
    const num = parseInt(quantity, 10) || 1
    const newUuids: string[] = []

    for (let i = 0; i < num; i++) {
      if (version === "v1") newUuids.push(uuidv1())
      else if (version === "v4") newUuids.push(uuidv4())
      else if (version === "v6") newUuids.push(uuidv6())
      else if (version === "v7") newUuids.push(uuidv7())
    }

    setRawUuids(newUuids)
  }, [version, quantity])

  React.useEffect(() => {
    generateUuids()
  }, [generateUuids])

  // Formatting toggles re-shape the already generated UUIDs instead of
  // generating new ones, so they only re-render the derived output.
  const results = React.useMemo(() => {
    return rawUuids
      .map((id) => {
        let formatted = hyphens ? id : id.replace(/-/g, "")
        if (uppercase) formatted = formatted.toUpperCase()
        if (quoteType === "single") formatted = `'${formatted}'`
        else if (quoteType === "double") formatted = `"${formatted}"`
        return formatted
      })
      .join("\n")
  }, [rawUuids, hyphens, uppercase, quoteType])

  const copyToClipboard = React.useCallback(async () => {
    if (!results) return
    await navigator.clipboard.writeText(results)
    toast.add({
      type: "success",
      title: "Copiado",
      description: "UUID(s) copiados al portapapeles.",
    })
  }, [results])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">UUID Generator</h1>
        <p className="text-muted-foreground text-sm">
          Genera identificadores únicos universales en múltiples versiones y formatos.
        </p>
      </div>

      {/* Fixed-height grid: each card fills the row, textarea scrolls internally */}
      <div className="grid gap-6 md:grid-cols-2" style={{ gridAutoRows: "1fr" }}>

        {/* Output card */}
        <Card className="flex flex-col min-h-115">
          <CardHeader className="shrink-0">
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
            <Textarea
              className="mt-1 flex-1 overflow-y-auto font-mono resize-none text-sm"
              readOnly
              value={results}
              placeholder="Los UUIDs aparecerán aquí..."
            />
            <div className="flex shrink-0 gap-2">
              <Button onClick={generateUuids} className="flex-1">
                <RefreshCwIcon data-icon="inline-start" />
                Generar
              </Button>
              <Button onClick={copyToClipboard} variant="secondary" className="flex-1">
                <CopyIcon data-icon="inline-start" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings card */}
        <Card className="flex flex-col min-h-115">
          <CardHeader className="shrink-0">
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Ajusta el comportamiento del generador.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {/* Version select — renders label manually from state */}
              <Field>
                <FieldLabel>Versión</FieldLabel>
                <Select
                  value={version}
                  onValueChange={(v) => setVersion(v as UuidVersion)}
                >
                  <SelectTrigger className="w-full">
                    <span>
                      {selectedVersionLabel
                        ? `${selectedVersionLabel.label} — ${selectedVersionLabel.description}`
                        : "Selecciona versión"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {VERSION_OPTIONS.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label} — {v.description}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* Quantity toggle */}
              <Field>
                <FieldLabel>Cantidad</FieldLabel>
                <ToggleGroup
                  defaultValue={["1"]}
                  onValueChange={(v: string[]) => {
                    if (v.length > 0) setQuantity(v[0])
                  }}
                >
                  {["1", "5", "10", "50"].map((q) => (
                    <ToggleGroupItem key={q} value={q}>
                      {q}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              {/* Hyphens choice card */}
              <FieldLabel htmlFor="switch-hyphens">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Incluir Guiones</FieldTitle>
                    <FieldDescription>Formato estándar 8-4-4-4-12.</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-hyphens"
                    checked={hyphens}
                    onCheckedChange={setHyphens}
                  />
                </Field>
              </FieldLabel>

              {/* Uppercase choice card */}
              <FieldLabel htmlFor="switch-uppercase">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Mayúsculas</FieldTitle>
                    <FieldDescription>Convertir a formato MAYÚSCULAS.</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-uppercase"
                    checked={uppercase}
                    onCheckedChange={setUppercase}
                  />
                </Field>
              </FieldLabel>

              {/* Quotes select — renders label manually from state */}
              <Field>
                <FieldLabel>Envolver en comillas</FieldLabel>
                <Select
                  value={quoteType}
                  onValueChange={(v) => setQuoteType(v as QuoteType)}
                >
                  <SelectTrigger className="w-full">
                    <span>{selectedQuoteLabel?.label ?? "Ninguna"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {QUOTE_OPTIONS.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

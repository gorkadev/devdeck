import * as React from "react"
import { v1 as uuidv1, v4 as uuidv4, v6 as uuidv6, v7 as uuidv7 } from "uuid"
import { CopyIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field"
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCopy } from "@/hooks/use-copy"
import { ToolHeader } from "@/components/shared/tool-header"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "uuid-generator"
const VERSIONS = ["v1", "v4", "v6", "v7"] as const
const QUANTITIES = ["1", "5", "10", "50"] as const
const QUOTES = ["none", "single", "double"] as const
type UuidVersion = (typeof VERSIONS)[number]
type Quantity = (typeof QUANTITIES)[number]
type QuoteType = (typeof QUOTES)[number]

const GENERATORS: Record<UuidVersion, () => string> = { v1: uuidv1, v4: uuidv4, v6: uuidv6, v7: uuidv7 }

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
  const copy = useCopy()
  const [version, setVersion] = useToolState<UuidVersion>(TOOL, "version", "v4", { parse: parsers.oneOf(VERSIONS) })
  const [quantity, setQuantity] = useToolState<Quantity>(TOOL, "qty", "1", { parse: parsers.oneOf(QUANTITIES) })
  const [hyphens, setHyphens] = useToolState(TOOL, "hyphens", true, { parse: parsers.boolean() })
  const [uppercase, setUppercase] = useToolState(TOOL, "uppercase", false, { parse: parsers.boolean() })
  const [quoteType, setQuoteType] = useToolState<QuoteType>(TOOL, "quotes", "none", { parse: parsers.oneOf(QUOTES) })
  const [rawUuids, setRawUuids] = React.useState<string[]>([])

  const selectedVersionLabel = VERSION_OPTIONS.find((v) => v.value === version)
  const selectedQuoteLabel = QUOTE_OPTIONS.find((q) => q.value === quoteType)

  const generateUuids = React.useCallback(() => {
    setRawUuids(Array.from({ length: Number(quantity) }, () => GENERATORS[version]()))
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ToolHeader
        url="/uuid-generator"
        description="Genera identificadores únicos universales en varias versiones y formatos."
      />

      <div className="grid gap-4 md:grid-cols-2">

        {/* Output card */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>
              {rawUuids.length} UUID{rawUuids.length === 1 ? "" : "s"} {version}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <Textarea
              aria-label="UUIDs generados"
              spellCheck={false}
              className="min-h-64 flex-1 resize-none font-mono text-sm"
              readOnly
              value={results}
              placeholder="Los UUIDs aparecerán aquí..."
            />
            <div className="flex shrink-0 gap-2">
              <Button onClick={generateUuids} className="flex-1">
                <RefreshCwIcon data-icon="inline-start" />
                Generar
              </Button>
              <Button onClick={() => copy(results, "UUID(s) copiados al portapapeles.")} variant="outline" className="flex-1">
                <CopyIcon data-icon="inline-start" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings card */}
        <Card>
          <CardHeader>
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
                  variant="outline"
                  aria-label="Cantidad"
                  value={[quantity]}
                  onValueChange={(v: string[]) => {
                    if (v.length > 0) setQuantity(v[0] as Quantity)
                  }}
                >
                  {QUANTITIES.map((q) => (
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
                    <FieldTitle>Incluir guiones</FieldTitle>
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
                    <FieldDescription>Hexadecimal en MAYÚSCULAS.</FieldDescription>
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

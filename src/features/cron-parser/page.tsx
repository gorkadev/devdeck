import * as React from "react"
import { CopyIcon, TriangleAlertIcon } from "lucide-react"
import cronstrue from "cronstrue"
import "cronstrue/locales/es"
import { CronExpressionParser } from "cron-parser"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ToolHeader } from "@/components/shared/tool-header"
import { useCopy } from "@/hooks/use-copy"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"
import { cn } from "@/lib/utils"

const TOOL = "cron-parser"
const ITERATION_OPTIONS = [5, 10, 20, 50] as const
type Iterations = (typeof ITERATION_OPTIONS)[number]

const PRESETS = [
  { expr: "* * * * *", desc: "Cada minuto" },
  { expr: "*/15 * * * *", desc: "Cada 15 minutos" },
  { expr: "0 * * * *", desc: "Cada hora" },
  { expr: "0 0 * * *", desc: "Cada día a medianoche" },
  { expr: "0 0 * * 0", desc: "Cada domingo" },
  { expr: "0 9 * * 1-5", desc: "Laborables a las 9:00" },
]

const FIELDS = [
  { label: "Minuto", short: "Min" },
  { label: "Hora", short: "Hora" },
  { label: "Día del mes", short: "Día" },
  { label: "Mes", short: "Mes" },
  { label: "Día de la semana", short: "Sem" },
]

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function describeCron(expression: string, iterations: number) {
  try {
    const humanReadable = cronstrue.toString(expression, { locale: "es", use24HourTimeFormat: true })
    const interval = CronExpressionParser.parse(expression)
    const nextDates: string[] = []
    for (let i = 0; i < iterations && interval.hasNext(); i++) {
      nextDates.push(DATE_FORMAT.format(interval.next().toDate()))
    }
    return { isValid: true as const, humanReadable, nextDates }
  } catch (error) {
    return {
      isValid: false as const,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function CronParserPage() {
  const copy = useCopy()
  const [expression, setExpression] = useToolState(TOOL, "expr", "*/15 * * * *", {
    parse: parsers.string(200),
  })
  const [iterations, setIterations] = useToolState<Iterations>(TOOL, "iterations", 5, {
    parse: parsers.oneOf(ITERATION_OPTIONS),
  })

  const parts = expression.trim().split(/\s+/)
  const cron = React.useMemo(() => describeCron(expression, iterations), [expression, iterations])
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ToolHeader
        url="/cron-parser"
        description="Traduce expresiones cron a lenguaje humano y visualiza sus próximas ejecuciones."
      />

      <Card>
        <CardHeader>
          <CardTitle>Expresión</CardTitle>
          <CardDescription>Formato estándar de 5 campos. También acepta segundos y alias como @daily.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InputGroup className="h-16">
            <InputGroupInput
              value={expression}
              onChange={(e) => setExpression(e.target.value.slice(0, 200))}
              placeholder="* * * * *"
              aria-label="Expresión cron"
              aria-invalid={!cron.isValid}
              spellCheck={false}
              autoComplete="off"
              className="text-center font-mono text-2xl! sm:text-3xl!"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label="Copiar expresión"
                onClick={() => copy(expression, "Expresión cron copiada.")}
              >
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <div className="grid grid-cols-5 gap-2">
            {FIELDS.map((field, i) => (
              <div
                key={field.label}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-xl border bg-muted/40 px-1 py-2 text-center",
                  !parts[i] && "opacity-50"
                )}
              >
                <span className="text-[11px] font-medium text-muted-foreground">
                  <span className="sm:hidden">{field.short}</span>
                  <span className="hidden sm:inline">{field.label}</span>
                </span>
                <span className="max-w-full truncate font-mono text-sm">{parts[i] || "–"}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Presets</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.expr}
                  size="sm"
                  variant={expression === preset.expr ? "secondary" : "outline"}
                  onClick={() => setExpression(preset.expr)}
                  aria-pressed={expression === preset.expr}
                >
                  {preset.desc}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>En lenguaje claro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
            {cron.isValid ? (
              <p className="text-xl font-medium text-balance">{cron.humanReadable}</p>
            ) : (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>Expresión inválida o incompleta</AlertTitle>
                <AlertDescription className="break-words">{cron.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas ejecuciones</CardTitle>
            <CardDescription>Zona horaria: {timeZone}</CardDescription>
            <CardAction>
              <ToggleGroup
                variant="outline"
                size="sm"
                aria-label="Número de ejecuciones"
                value={[String(iterations)]}
                onValueChange={(v: string[]) => {
                  if (v.length > 0) setIterations(Number(v[0]) as Iterations)
                }}
              >
                {ITERATION_OPTIONS.map((n) => (
                  <ToggleGroupItem key={n} value={String(n)}>
                    {n}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            {cron.isValid && cron.nextDates.length > 0 ? (
              <ScrollArea className="h-56 rounded-xl border">
                <ol className="flex flex-col divide-y">
                  {cron.nextDates.map((date, idx) => (
                    <li key={idx} className="flex items-center gap-4 px-4 py-2.5">
                      <span className="w-6 text-right font-mono text-xs text-muted-foreground tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm tabular-nums">{date}</span>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            ) : (
              <Empty className="h-56 border">
                <EmptyHeader>
                  <EmptyTitle>Sin ejecuciones</EmptyTitle>
                  <EmptyDescription>Introduce una expresión válida para calcularlas.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import * as React from "react"
import { CopyIcon } from "lucide-react"
import cronstrue from "cronstrue/i18n"
import { CronExpressionParser } from "cron-parser"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCopy } from "@/hooks/use-copy"
import { useURLSync } from "@/hooks/use-url-sync"

const PRESETS = [
  { label: "* * * * *", desc: "Cada minuto" },
  { label: "*/15 * * * *", desc: "Cada 15 min" },
  { label: "0 * * * *", desc: "Cada hora" },
  { label: "0 0 * * *", desc: "Medianoche" },
  { label: "0 0 * * 0", desc: "Domingos" },
  { label: "0 9 * * 1-5", desc: "L-V a las 9am" },
]

export function CronParserPage() {
  const copy = useCopy()
  const [expression, setExpression] = useURLSync<string>("expr", "*/15 * * * *")
  const [iterations, setIterations] = useURLSync<number>("iterations", 5)

  // Desglose visual
  const parts = expression.trim().split(/\s+/)
  const getPart = (index: number) => parts[index] || ""

  // Lógica principal (useMemo para no recalcular en cada render de forma pesada)
  const cronData = React.useMemo(() => {
    try {
      const humanReadable = cronstrue.toString(expression, { locale: "es", use24HourTimeFormat: true })

      const interval = CronExpressionParser.parse(expression)
      const nextDates: string[] = []
      for (let i = 0; i < iterations; i++) {
        // Formato legible: YYYY-MM-DD HH:mm:ss ddd
        const date = interval.next().toDate()
        const formatted = date.toLocaleString("es-ES", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          weekday: "short"
        })
        nextDates.push(formatted)
      }
      return { humanReadable, nextDates, isValid: true }
    } catch {
      return { humanReadable: "Expresión inválida o incompleta.", nextDates: [], isValid: false }
    }
  }, [expression, iterations])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Cron Expression Parser</h1>
        <p className="text-muted-foreground text-sm">
          Traduce expresiones Cron a lenguaje humano y visualiza sus próximas ejecuciones.
        </p>
      </div>

      {/* TOP CARD: PRESETS */}
      <Card>
        <CardHeader>
          <CardTitle>Presets Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <Button
              key={p.label}
              variant={expression === p.label ? "default" : "outline"}
              onClick={() => setExpression(p.label)}
              title={p.desc}
              className="font-mono text-xs px-3"
            >
              {p.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* CENTER CARD: EXPRESSION */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Expresión Cron</CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={() => copy(expression, "Expresión Cron copiada.")} title="Copiar expresión">
            <CopyIcon />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="text-3xl! sm:text-4xl! font-mono text-center h-auto p-4"
            placeholder="* * * * *"
          />

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {[
              { label: "MINUTO", val: getPart(0) },
              { label: "HORA", val: getPart(1) },
              { label: "DÍA DEL MES", val: getPart(2) },
              { label: "MES", val: getPart(3) },
              { label: "DÍA SEMANA", val: getPart(4) },
            ].map((box, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center space-y-1 transition-colors
                  ${!cronData.isValid && box.val ? 'bg-destructive/20' : 'bg-muted/50'}
                  ${!box.val ? 'opacity-50' : ''}
                `}
              >
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{box.label}</span>
                <span className="font-mono text-sm sm:text-base text-foreground break-all">{box.val || "-"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BOTTOM GRID: 2 COLUMNS */}
      <div className="grid gap-6 md:grid-cols-2" style={{ gridAutoRows: "1fr" }}>

        {/* LEFT: HUMAN READABLE */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>En Lenguaje Claro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center min-h-30">
            <p className={`text-xl text-center font-medium ${cronData.isValid ? 'text-emerald-500' : 'text-destructive'}`}>
              {cronData.humanReadable}
            </p>
          </CardContent>
        </Card>

        {/* RIGHT: NEXT EXECUTIONS */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center space-y-0">
            <CardTitle>Próximas Ejecuciones</CardTitle>
            <Select
              value={iterations.toString()}
              onValueChange={(val) => {
                if (val) setIterations(Number(val))
              }}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue placeholder="Cantidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1">
            {cronData.isValid ? (
              <ScrollArea className="h-55 rounded-lg">
                <div className="flex flex-col bg-muted/50">
                  {cronData.nextDates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-6 py-3">
                      <span className="text-xs text-muted-foreground w-6 text-right font-mono">{idx + 1}</span>
                      <span className="font-mono text-sm">{date}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full min-h-30 text-muted-foreground p-6 text-center">
                Esperando expresión válida...
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

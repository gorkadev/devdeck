import * as React from "react"
import { CopyIcon, CheckCircle2, XCircle, LockKeyhole } from "lucide-react"
import bcrypt from "bcryptjs"
import { toast } from "@/components/ui/toast"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useCopy } from "@/hooks/use-copy"
import { ToolHeader } from "@/components/shared/tool-header"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "bcrypt-generator"
const MIN_ROUNDS = 4
const MAX_ROUNDS = 16

// Passwords and hashes stay in memory only: never in the URL nor in storage.
const SECRET = { parse: parsers.string(), url: false, persist: false } as const

// Helper para obtener el texto dinámico y color según rondas
function getSecurityInfo(rounds: number) {
  if (rounds <= 8) {
    return { text: "Inseguro / Muy rápido", colorClass: "text-destructive" }
  }
  if (rounds <= 11) {
    return { text: "Débil / Rápido", colorClass: "text-muted-foreground" }
  }
  if (rounds <= 13) {
    return { text: "Recomendado / Estándar", colorClass: "text-foreground" }
  }
  return { text: "Muy seguro / Lento (puede tardar segundos)", colorClass: "text-foreground" }
}

export function BcryptGeneratorPage() {
  const copy = useCopy()
  const [genText, setGenTextState] = useToolState(TOOL, "text", "", SECRET)
  const [rounds, setRoundsState] = useToolState(TOOL, "rounds", 10, {
    parse: parsers.int(MIN_ROUNDS, MAX_ROUNDS),
  })
  const [verHash, setVerHashState] = useToolState(TOOL, "verhash", "", SECRET)
  const [verText, setVerTextState] = useToolState(TOOL, "vertext", "", SECRET)

  // Generation State
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedHash, setGeneratedHash] = React.useState("")
  const [generatedCost, setGeneratedCost] = React.useState(0)

  // Verification State
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verifyResult, setVerifyResult] = React.useState<"success" | "error" | null>(null)

  // bcrypt async chunks work between event-loop turns; guards drop stale
  // completions when the user edits the inputs mid-run.
  const generateRun = React.useRef(0)
  const verifyRun = React.useRef(0)

  // A result only describes the inputs it was computed from: editing them
  // invalidates it (and any run still in flight).
  const resetGenerated = () => {
    generateRun.current++
    setIsGenerating(false)
    setGeneratedHash("")
  }
  const resetVerify = () => {
    verifyRun.current++
    setIsVerifying(false)
    setVerifyResult(null)
  }
  const setGenText = (value: string) => {
    setGenTextState(value)
    resetGenerated()
  }
  const setRounds = (value: number) => {
    setRoundsState(value)
    resetGenerated()
  }
  const setVerHash = (value: string) => {
    setVerHashState(value)
    resetVerify()
  }
  const setVerText = (value: string) => {
    setVerTextState(value)
    resetVerify()
  }

  const handleGenerate = async () => {
    if (!genText) return
    const run = ++generateRun.current
    setIsGenerating(true)
    setGeneratedHash("")

    try {
      const hash = await bcrypt.hash(genText, rounds)
      if (run === generateRun.current) {
        setGeneratedHash(hash)
        setGeneratedCost(rounds)
      }
    } catch (err) {
      if (run === generateRun.current) {
        console.error(err)
        toast.add({ type: "error", title: "Error", description: "Fallo al generar el hash." })
      }
    } finally {
      if (run === generateRun.current) setIsGenerating(false)
    }
  }

  const handleVerify = async () => {
    if (!verHash || !verText) return
    const run = ++verifyRun.current
    setIsVerifying(true)
    setVerifyResult(null)

    try {
      const matches = await bcrypt.compare(verText, verHash)
      if (run === verifyRun.current) {
        setVerifyResult(matches ? "success" : "error")
      }
    } catch (err) {
      if (run === verifyRun.current) {
        console.error(err)
        setVerifyResult("error")
      }
    } finally {
      if (run === verifyRun.current) setIsVerifying(false)
    }
  }

  const secInfo = getSecurityInfo(rounds)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ToolHeader
        url="/bcrypt-generator"
        description="Genera hashes bcrypt con coste variable y comprueba si una contraseña coincide."
      />

      <div className="grid items-start gap-4 md:grid-cols-2">

        {/* LEFT CARD: Generate */}
        <Card>
          <CardHeader>
            <CardTitle>Generar hash</CardTitle>
            <CardDescription>A mayor número de rondas, mayor coste computacional (más lento pero más seguro).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="bcrypt-text">Texto a hashear</FieldLabel>
                <Input
                  id="bcrypt-text"
                  type="password"
                  autoComplete="off"
                  value={genText}
                  onChange={(e) => setGenText(e.target.value)}
                  placeholder="Introduce la contraseña o texto"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Rondas (factor de coste)</FieldLabel>
                  <Badge variant="secondary" className="font-mono tabular-nums">{rounds}</Badge>
                </div>
                <Slider
                  aria-label="Rondas"
                  min={MIN_ROUNDS}
                  max={MAX_ROUNDS}
                  step={1}
                  value={rounds}
                  onValueChange={(value) => setRounds(Array.isArray(value) ? value[0] : value)}
                />
                <FieldDescription className={cn("font-medium transition-colors", secInfo.colorClass)}>
                  {secInfo.text}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <Button
              onClick={handleGenerate}
              disabled={!genText || isGenerating}
              className="w-full"
            >
              {isGenerating ? <Spinner data-icon="inline-start" /> : <LockKeyhole data-icon="inline-start" />}
              {isGenerating ? "Generando..." : "Generar hash"}
            </Button>

            {generatedHash && (
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 pt-1 font-mono text-sm break-all select-all">
                    {generatedHash}
                  </div>
                  <Button variant="outline" size="icon-sm" aria-label="Copiar hash" onClick={() => copy(generatedHash, "Hash bcrypt copiado al portapapeles.")} className="shrink-0">
                    <CopyIcon />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Generado con factor de coste {generatedCost}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT CARD: Verify */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar hash</CardTitle>
            <CardDescription>Comprueba si una contraseña coincide con un hash bcrypt específico.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="bcrypt-hash">Hash bcrypt</FieldLabel>
                <Textarea
                  id="bcrypt-hash"
                  spellCheck={false}
                  value={verHash}
                  onChange={(e) => setVerHash(e.target.value)}
                  placeholder="$2a$10$..."
                  className="font-mono text-sm resize-none h-20"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="bcrypt-plain">Texto original</FieldLabel>
                <Input
                  id="bcrypt-plain"
                  type="password"
                  autoComplete="off"
                  value={verText}
                  onChange={(e) => setVerText(e.target.value)}
                  placeholder="Introduce el texto a comparar"
                />
              </Field>
            </FieldGroup>

            <Button
              onClick={handleVerify}
              disabled={!verHash || !verText || isVerifying}
              className="w-full"
            >
              {isVerifying ? <Spinner data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
              {isVerifying ? "Verificando..." : "Verificar hash"}
            </Button>
          </CardContent>
          {verifyResult && (
            <CardFooter className="flex-col items-stretch">
              {verifyResult === "success" && (
                <Alert>
                  <CheckCircle2 />
                  <AlertTitle>Coincide</AlertTitle>
                  <AlertDescription>El texto corresponde a este hash.</AlertDescription>
                </Alert>
              )}
              {verifyResult === "error" && (
                <Alert variant="destructive">
                  <XCircle />
                  <AlertTitle>No coincide</AlertTitle>
                  <AlertDescription>El texto no corresponde a este hash, o el hash no es válido.</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

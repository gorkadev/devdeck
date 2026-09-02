import * as React from "react"
import { CopyIcon, CheckCircle2, XCircle, RefreshCwIcon, LockKeyhole } from "lucide-react"
import bcrypt from "bcryptjs"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

// Helper para obtener el texto dinámico y color según rondas
function getSecurityInfo(rounds: number) {
  if (rounds <= 8) {
    return { text: "Inseguro / Muy rápido", colorClass: "text-destructive" }
  }
  if (rounds <= 11) {
    return { text: "Débil / Rápido", colorClass: "text-orange-500" }
  }
  if (rounds <= 13) {
    return { text: "Recomendado / Estándar", colorClass: "text-emerald-500" }
  }
  return { text: "Máxima Seguridad / Muy Lento", colorClass: "text-primary" }
}

export function BcryptGeneratorPage() {
  // Generation State
  const [genText, setGenText] = React.useState("")
  const [rounds, setRounds] = React.useState(10) // Slider value is an array
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedHash, setGeneratedHash] = React.useState("")
  const [generatedCost, setGeneratedCost] = React.useState(0)

  // Verification State
  const [verHash, setVerHash] = React.useState("")
  const [verText, setVerText] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verifyResult, setVerifyResult] = React.useState<"success" | "error" | null>(null)

  // bcrypt async chunks work between event-loop turns; guards drop stale
  // completions when the user edits the inputs mid-run.
  const generateRun = React.useRef(0)
  const verifyRun = React.useRef(0)

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

  const copyToClipboard = async () => {
    if (!generatedHash) return
    await navigator.clipboard.writeText(generatedHash)
    toast.add({ type: "success", title: "Copiado", description: "Hash bcrypt copiado al portapapeles." })
  }

  const secInfo = getSecurityInfo(rounds)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Bcrypt Generator & Verifier</h1>
        <p className="text-muted-foreground text-sm">
          Genera hashes con costo variable y verifica coincidencias de contraseñas de forma segura.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2" style={{ gridAutoRows: "1fr" }}>

        {/* LEFT CARD: Generate */}
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Generar Hash</CardTitle>
            <CardDescription>A mayor número de rondas, mayor coste computacional (más lento pero más seguro).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Texto a hashear</FieldLabel>
                <Input
                  value={genText}
                  onChange={(e) => setGenText(e.target.value)}
                  placeholder="Introduce la contraseña o texto"
                />
              </Field>

              <Field>
                <div className="flex justify-between items-center mb-2">
                  <FieldLabel className="mb-0">Rounds (Cost Factor): {rounds}</FieldLabel>
                </div>
                <Slider
                  min={4}
                  max={16}
                  step={1}
                  value={rounds}
                  onValueChange={rounds => setRounds(rounds as number)}
                />
                <FieldDescription className={`mt-2 font-medium transition-colors ${secInfo.colorClass}`}>
                  {secInfo.text}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <Button
              onClick={handleGenerate}
              disabled={!genText || isGenerating}
              className="w-full"
            >
              {isGenerating ? <RefreshCwIcon className="animate-spin" data-icon="inline-start" /> : <LockKeyhole data-icon="inline-start" />}
              {isGenerating ? "Generando..." : "Generar Hash"}
            </Button>

            {generatedHash && (
              <div className="mt-4 p-4 bg-muted/30 border rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="font-mono text-sm break-all flex-1 select-all pt-1">
                    {generatedHash}
                  </div>
                  <Button variant="secondary" size="icon-sm" onClick={copyToClipboard} className="shrink-0">
                    <CopyIcon className="size-4" />
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
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Verificar Hash</CardTitle>
            <CardDescription>Comprueba si una contraseña coincide con un hash bcrypt específico.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Bcrypt Hash</FieldLabel>
                <Textarea
                  value={verHash}
                  onChange={(e) => setVerHash(e.target.value)}
                  placeholder="$2a$10$..."
                  className="font-mono text-sm resize-none h-20"
                />
              </Field>

              <Field>
                <FieldLabel>Texto original</FieldLabel>
                <Input
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
              {isVerifying ? <RefreshCwIcon className="animate-spin" data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
              {isVerifying ? "Verificando..." : "Verificar Hash"}
            </Button>
          </CardContent>
          {verifyResult && (
            <CardFooter className="flex-col items-stretch">
              {verifyResult === "success" && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <span className="font-medium text-sm">El hash coincide con el texto.</span>
                </div>
              )}
              {verifyResult === "error" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <XCircle className="size-5 shrink-0" />
                  <span className="font-medium text-sm">El hash NO coincide con el texto, o el hash es inválido.</span>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

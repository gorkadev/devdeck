import * as React from "react"
import {
  CheckCircle2Icon,
  ClockIcon,
  CopyIcon,
  EraserIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { SignJWT, base64url, compactVerify, decodeJwt, decodeProtectedHeader } from "jose"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/shared/code-editor"
import { jwtHighlightPlugin } from "@/components/shared/jwt-highlight-plugin"
import { ToolHeader } from "@/components/shared/tool-header"
import { useCopy } from "@/hooks/use-copy"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "jwt-decoder"
const TABS = ["decoder", "encoder"] as const
type Tab = (typeof TABS)[number]

// Tokens and keys are credentials: they live in memory only. `url: false` also
// strips them from links created by older versions that put them in the URL.
const SECRET = { parse: parsers.string(), url: false, persist: false } as const

// Example token signed with "your-256-bit-secret", so verification can be tried right away.
const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.reGQzG3OKdoIMWLDKOZ4TICJit3EW69cQE72E2CfzRE"
const DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}'
const DEFAULT_PAYLOAD = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}'
const HMAC_ALGORITHMS = ["HS256", "HS384", "HS512"]

const EDITOR_SETUP = { lineNumbers: false, foldGutter: false }

function secretToKey(secret: string, isBase64Url: boolean) {
  return isBase64Url ? base64url.decode(secret) : new TextEncoder().encode(secret)
}

function formatDate(seconds: number) {
  return new Date(seconds * 1000).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
}

type Decoded =
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ok"; header: Record<string, unknown>; payload: Record<string, unknown> }

function decodeToken(token: string): Decoded {
  if (!token.trim()) return { status: "empty" }
  try {
    return {
      status: "ok",
      header: decodeProtectedHeader(token.trim()) as Record<string, unknown>,
      payload: decodeJwt(token.trim()) as Record<string, unknown>,
    }
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Formato JWT inválido" }
  }
}

export function JwtDecoderPage() {
  const [tab, setTab] = useToolState<Tab>(TOOL, "tab", "decoder", { parse: parsers.oneOf(TABS) })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <ToolHeader url="/jwt-decoder" />
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="gap-6">
        <TabsList>
          <TabsTrigger value="decoder">Decodificar</TabsTrigger>
          <TabsTrigger value="encoder">Firmar</TabsTrigger>
        </TabsList>
        <TabsContent value="decoder" keepMounted>
          <Decoder />
        </TabsContent>
        <TabsContent value="encoder" keepMounted>
          <Encoder />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Decoder() {
  const copy = useCopy()
  const [token, setToken] = useToolState(TOOL, "token", DEFAULT_TOKEN, SECRET)
  const [secret, setSecret] = useToolState(TOOL, "secret", "", SECRET)
  const [isBase64Url, setIsBase64Url] = useToolState(TOOL, "b64url", false, { parse: parsers.boolean() })
  const [signature, setSignature] = React.useState<"valid" | "invalid" | "unsupported" | null>(null)

  const decoded = React.useMemo(() => decodeToken(token), [token])
  const alg = decoded.status === "ok" ? String(decoded.header.alg ?? "") : ""

  // Only the signature is checked here. Expiry is reported separately below, so
  // an expired token signed with the right key is not shown as "invalid".
  React.useEffect(() => {
    if (decoded.status !== "ok" || !secret) {
      setSignature(null)
      return
    }
    if (!HMAC_ALGORITHMS.includes(alg)) {
      setSignature("unsupported")
      return
    }
    let cancelled = false
    // Build the key inside the chain: a malformed Base64URL secret throws, and
    // that must surface as "invalid", not escape the effect and crash the page.
    Promise.resolve()
      .then(() => compactVerify(token.trim(), secretToKey(secret, isBase64Url), { algorithms: [alg] }))
      .then(() => !cancelled && setSignature("valid"))
      .catch(() => !cancelled && setSignature("invalid"))
    return () => {
      cancelled = true
    }
  }, [decoded, alg, token, secret, isBase64Url])

  const payload = decoded.status === "ok" ? decoded.payload : null
  // Snapshot of "now" for the expiry badge; refreshed whenever the page mounts.
  const [now] = React.useState(() => Date.now() / 1000)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:self-start">
        <CardHeader>
          <CardTitle>Token</CardTitle>
          <CardDescription>Pega un JWT para decodificarlo. No se guarda en ningún sitio.</CardDescription>
          <CardAction className="flex gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Copiar token" onClick={() => copy(token, "Token copiado al portapapeles.")} disabled={!token}>
              <CopyIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Limpiar token" onClick={() => setToken("")} disabled={!token}>
              <EraserIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CodeEditor
            value={token}
            onChange={setToken}
            language="none"
            placeholder="eyJhbGciOi..."
            aria-label="Token JWT"
            className="min-h-56 bg-muted/40 lg:min-h-80"
            extensions={[jwtHighlightPlugin]}
            basicSetup={EDITOR_SETUP}
          />
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          {decoded.status === "error" && (
            <Badge variant="destructive">
              <ShieldAlertIcon data-icon="inline-start" />
              JWT inválido
            </Badge>
          )}
          {decoded.status === "ok" && (
            <Badge variant="secondary">
              <CheckCircle2Icon data-icon="inline-start" />
              Formato válido · {alg || "sin alg"}
            </Badge>
          )}
          {signature === "valid" && (
            <Badge variant="secondary">
              <ShieldCheckIcon data-icon="inline-start" />
              Firma verificada
            </Badge>
          )}
          {signature === "invalid" && (
            <Badge variant="destructive">
              <ShieldAlertIcon data-icon="inline-start" />
              Firma inválida
            </Badge>
          )}
          {payload && typeof payload.exp === "number" && (
            <Badge variant={payload.exp < now ? "destructive" : "outline"}>
              <ClockIcon data-icon="inline-start" />
              {payload.exp < now ? "Expirado" : "Vigente"}
            </Badge>
          )}
        </CardFooter>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        {decoded.status === "error" && (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>No se pudo decodificar</AlertTitle>
            <AlertDescription className="break-words">{decoded.message}</AlertDescription>
          </Alert>
        )}

        <JsonCard
          title="Header"
          description="Algoritmo y tipo de token"
          value={decoded.status === "ok" ? JSON.stringify(decoded.header, null, 2) : ""}
        />
        <JsonCard
          title="Payload"
          description="Claims del token"
          value={payload ? JSON.stringify(payload, null, 2) : ""}
          footer={payload && <ClaimDates payload={payload} />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Verificar firma</CardTitle>
            <CardDescription>Clave HMAC con la que se firmó el token (HS256, HS384 o HS512).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              autoComplete="off"
              aria-label="Clave secreta"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              className="font-mono"
            />
            <Field orientation="horizontal">
              <Switch id="jwt-b64-secret" checked={isBase64Url} onCheckedChange={setIsBase64Url} />
              <FieldLabel htmlFor="jwt-b64-secret">La clave está en Base64URL</FieldLabel>
            </Field>
            {signature === "unsupported" && (
              <FieldDescription>
                Este token usa {alg || "un algoritmo desconocido"}: solo se pueden verificar firmas HMAC.
              </FieldDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Encoder() {
  const copy = useCopy()
  const [header, setHeader] = useToolState(TOOL, "enc-header", DEFAULT_HEADER, SECRET)
  const [payload, setPayload] = useToolState(TOOL, "enc-payload", DEFAULT_PAYLOAD, SECRET)
  const [secret, setSecret] = useToolState(TOOL, "enc-secret", "your-256-bit-secret", SECRET)
  const [isBase64Url, setIsBase64Url] = useToolState(TOOL, "enc-b64url", false, { parse: parsers.boolean() })
  const [signed, setSigned] = React.useState<{ token: string; error: string | null }>({ token: "", error: null })

  const parsed = React.useMemo(() => {
    const parseObject = (text: string, label: string) => {
      try {
        const value: unknown = JSON.parse(text)
        if (value === null || typeof value !== "object" || Array.isArray(value)) {
          return { error: `El ${label} debe ser un objeto JSON.` }
        }
        return { value: value as Record<string, unknown> }
      } catch {
        return { error: `El ${label} no es JSON válido.` }
      }
    }
    return { header: parseObject(header, "header"), payload: parseObject(payload, "payload") }
  }, [header, payload])

  React.useEffect(() => {
    const h = parsed.header.value
    const p = parsed.payload.value
    if (!h || !p) {
      setSigned({ token: "", error: null })
      return
    }
    if (typeof h.alg !== "string" || !HMAC_ALGORITHMS.includes(h.alg)) {
      setSigned({ token: "", error: 'El header debe incluir "alg": "HS256", "HS384" o "HS512".' })
      return
    }
    let cancelled = false
    const sign = async () => {
      try {
        const token = await new SignJWT(p)
          .setProtectedHeader(h as { alg: string })
          .sign(secretToKey(secret, isBase64Url))
        if (!cancelled) setSigned({ token, error: null })
      } catch (error) {
        if (!cancelled) {
          setSigned({ token: "", error: error instanceof Error ? error.message : "No se pudo firmar el token." })
        }
      }
    }
    sign()
    return () => {
      cancelled = true
    }
  }, [parsed, secret, isBase64Url])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4">
        <JsonCard title="Header" description="Algoritmo y tipo de token" value={header} onChange={setHeader} error={parsed.header.error} />
        <JsonCard title="Payload" description="Claims del token" value={payload} onChange={setPayload} error={parsed.payload.error} />
        <Card>
          <CardHeader>
            <CardTitle>Clave de firma</CardTitle>
            <CardDescription>Se usa solo en este navegador y no se guarda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              autoComplete="off"
              aria-label="Clave de firma"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              className="font-mono"
            />
            <Field orientation="horizontal">
              <Switch id="jwt-enc-b64-secret" checked={isBase64Url} onCheckedChange={setIsBase64Url} />
              <FieldLabel htmlFor="jwt-enc-b64-secret">La clave está en Base64URL</FieldLabel>
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:self-start">
        <CardHeader>
          <CardTitle>Token firmado</CardTitle>
          <CardDescription>Se actualiza al editar header, payload o clave.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Copiar token" onClick={() => copy(signed.token, "Token copiado al portapapeles.")} disabled={!signed.token}>
              <CopyIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {signed.error ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>No se pudo firmar</AlertTitle>
              <AlertDescription className="break-words">{signed.error}</AlertDescription>
            </Alert>
          ) : (
            <CodeEditor
              value={signed.token}
              readOnly
              language="none"
              aria-label="Token firmado"
              className="min-h-56 bg-muted/40 lg:min-h-80"
              extensions={[jwtHighlightPlugin]}
              basicSetup={EDITOR_SETUP}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function JsonCard({
  title,
  description,
  value,
  onChange,
  error,
  footer,
}: {
  title: string
  description: string
  value: string
  onChange?: (value: string) => void
  error?: string
  footer?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {onChange && (
          <CardAction>
            {error ? (
              <Badge variant="destructive">JSON inválido</Badge>
            ) : (
              <Badge variant="secondary">JSON válido</Badge>
            )}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <CodeEditor
          value={value}
          onChange={onChange}
          readOnly={!onChange}
          aria-label={title}
          className="bg-muted/40"
          basicSetup={{ foldGutter: false }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      {footer}
    </Card>
  )
}

function ClaimDates({ payload }: { payload: Record<string, unknown> }) {
  const claims = [
    { key: "iat", label: "Emitido" },
    { key: "nbf", label: "Válido desde" },
    { key: "exp", label: "Expira" },
  ].filter((claim) => typeof payload[claim.key] === "number")

  if (claims.length === 0) return null

  return (
    <CardFooter className="flex-col items-stretch gap-1.5 border-t">
      {claims.map((claim) => (
        <div key={claim.key} className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">
            {claim.label} <span className="font-mono">({claim.key})</span>
          </span>
          <span className="font-mono tabular-nums">{formatDate(payload[claim.key] as number)}</span>
        </div>
      ))}
    </CardFooter>
  )
}

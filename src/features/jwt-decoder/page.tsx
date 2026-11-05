import * as React from "react"
import { ShieldAlertIcon, ShieldCheckIcon, CopyIcon, TrashIcon, TerminalIcon } from "lucide-react"
import { jwtVerify, decodeJwt, decodeProtectedHeader, SignJWT, base64url } from "jose"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CodeEditor } from "@/components/shared/code-editor"
import { jwtHighlightPlugin } from "@/components/shared/jwt-highlight-plugin"
import { useCopy } from "@/hooks/use-copy"
import { useURLSync } from "@/hooks/use-url-sync"

// Token de ejemplo por defecto (firmado con "your-256-bit-secret" para que la
// verificación de firma funcione al cargar la página)
const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.reGQzG3OKdoIMWLDKOZ4TICJit3EW69cQE72E2CfzRE"

export function JwtDecoderPage() {
  const copy = useCopy()
  const [token, setToken] = useURLSync<string>("token", DEFAULT_TOKEN)
  const [secret, setSecret] = useURLSync<string>("secret", "")
  const [isBase64Url, setIsBase64Url] = useURLSync<boolean>("b64url", false)

  // Decoded state
  const [header, setHeader] = React.useState<unknown>(null)
  const [payload, setPayload] = React.useState<unknown>(null)
  const [parseError, setParseError] = React.useState<string | null>(null)
  
  // Verification state
  const [isValidSignature, setIsValidSignature] = React.useState<boolean | null>(null)

  // Encoder state
  const [encoderHeader, setEncoderHeader] = useURLSync<string>("enc-header", '{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [encoderPayload, setEncoderPayload] = useURLSync<string>("enc-payload", '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [encoderSecret, setEncoderSecret] = useURLSync<string>("enc-secret", "your-256-bit-secret")
  const [isEncoderBase64Url, setIsEncoderBase64Url] = useURLSync<boolean>("enc-b64url", false)
  const [generatedToken, setGeneratedToken] = React.useState("")
  const [encoderHeaderError, setEncoderHeaderError] = React.useState<string | null>(null)
  const [encoderPayloadError, setEncoderPayloadError] = React.useState<string | null>(null)

  // Analizar el token básico (solo decode)
  React.useEffect(() => {
    if (!token.trim()) {
      setHeader(null)
      setPayload(null)
      setParseError(null)
      setIsValidSignature(null)
      return
    }

    try {
      const h = decodeProtectedHeader(token)
      const p = decodeJwt(token)
      setHeader(h)
      setPayload(p)
      setParseError(null)
    } catch (e: unknown) {
      setHeader(null)
      setPayload(null)
      if (e instanceof Error) {
        setParseError(e.message || "Invalid JWT format")
      } else {
        setParseError("Invalid JWT format")
      }
      setIsValidSignature(null)
    }
  }, [token])

  // Validar firma si hay secreto
  React.useEffect(() => {
    if (!token || !secret || parseError) {
      setIsValidSignature(null)
      return
    }

    const verify = async () => {
      try {
        const secretKey = isBase64Url
          ? base64url.decode(secret)
          : new TextEncoder().encode(secret)

        await jwtVerify(token, secretKey)
        setIsValidSignature(true)
      } catch {
        setIsValidSignature(false)
      }
    }

    verify()
  }, [token, secret, parseError, isBase64Url])

  const copyToken = (text: string) => copy(text, "Token copiado al portapapeles.")

  // Encode effect
  React.useEffect(() => {
    let parsedHeader: Record<string, unknown> | null = null
    let parsedPayload: Record<string, unknown> | null = null
    
    // Parse header
    try {
      parsedHeader = JSON.parse(encoderHeader)
      setEncoderHeaderError(null)
    } catch {
      setEncoderHeaderError("Invalid JSON format")
    }

    // Parse payload
    try {
      parsedPayload = JSON.parse(encoderPayload)
      setEncoderPayloadError(null)
    } catch {
      setEncoderPayloadError("Invalid JSON format")
    }

    if (parsedHeader && parsedPayload) {
      const sign = async () => {
        try {
          const secretKey = isEncoderBase64Url
            ? base64url.decode(encoderSecret)
            : new TextEncoder().encode(encoderSecret)
          const token = await new SignJWT(parsedPayload)
            .setProtectedHeader(parsedHeader as { alg: string; [key: string]: unknown })
            .sign(secretKey)
          
          setGeneratedToken(token)
        } catch {
          setGeneratedToken("")
        }
      }
      sign()
    } else {
      setGeneratedToken("")
    }
  }, [encoderHeader, encoderPayload, encoderSecret, isEncoderBase64Url])

  // Cast payload to access properties safely in the render
  const payloadObj = payload as Record<string, unknown> | null;

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <Tabs defaultValue="decoder" className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="decoder">JWT Decoder</TabsTrigger>
            <TabsTrigger value="encoder">JWT Encoder</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="decoder" className="flex-1 mt-4 data-[state=inactive]:hidden outline-none">
          <div className="grid h-full gap-2 lg:grid-cols-2">
            
            {/* LEFT COLUMN - INPUT */}
            <div className="flex min-h-0 flex-col gap-2 px-2 pb-4">
              <h2 className="text-lg font-semibold">Encoded Token</h2>
              <Card className="flex-1 flex flex-col min-h-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                    <TerminalIcon className="size-4" />
                    <span>JSON Web Token (JWT)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => copyToken(token)}><CopyIcon /></Button>} />
                      <TooltipContent>Copy Token</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger render={<Button variant="destructive" size="icon-sm" onClick={() => setToken("")}><TrashIcon /></Button>} />
                      <TooltipContent>Clear</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col relative">
                  <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                    <CodeEditor
                      value={token}
                      onChange={setToken}
                      language="none"
                      className="border-0 bg-transparent flex-1 focus-visible:ring-0 break-all whitespace-pre-wrap"
                      extensions={[jwtHighlightPlugin]}
                      basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="text-sm font-medium">
                  {parseError ? (
                     <span className="text-destructive flex items-center gap-1"><ShieldAlertIcon className="size-4" /> Invalid JWT</span>
                  ) : token ? (
                     <span className="text-emerald-500 flex items-center gap-1"><ShieldCheckIcon className="size-4" /> Valid JWT format</span>
                  ) : null}
                  
                  {isValidSignature === true && (
                    <span className="text-emerald-500 flex items-center gap-1"><ShieldCheckIcon className="size-4" /> Signature Verified</span>
                  )}
                  {isValidSignature === false && (
                    <span className="text-destructive flex items-center gap-1"><ShieldAlertIcon className="size-4" /> Invalid Signature</span>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* RIGHT COLUMN - OUTPUT */}
            <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-2 pb-4">
              
              {/* HEADER */}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Decoded Header</h2>
                <Card>
                   <CardHeader>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-destructive">JSON</span>
                      <span className="text-muted-foreground">Algorithm & Token Type</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                      <CodeEditor
                        value={header ? JSON.stringify(header, null, 2) : ""}
                        readOnly
                        className="border-0 bg-transparent flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PAYLOAD */}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Decoded Payload</h2>
                <Card>
                   <CardHeader>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-primary">JSON</span>
                      <span className="text-muted-foreground">Data Claims</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                      <CodeEditor
                        value={payload ? JSON.stringify(payload, null, 2) : ""}
                        readOnly
                        className="border-0 bg-transparent flex-1"
                      />
                      {/* Mostrar fechas decodificadas extra si existen */}
                      {payloadObj && (typeof payloadObj.iat === 'number' || typeof payloadObj.exp === 'number') && (
                        <div className="absolute top-2 right-4 flex flex-col items-end gap-1 pointer-events-none">
                          {typeof payloadObj.iat === 'number' && <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md">iat: {new Date(payloadObj.iat * 1000).toLocaleString()}</span>}
                          {typeof payloadObj.exp === 'number' && <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md">exp: {new Date(payloadObj.exp * 1000).toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SIGNATURE VERIFICATION */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Verify Signature</h2>
                    <p className="text-xs text-muted-foreground">Enter the secret used to sign the JWT below:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="base64-switch" className="text-xs text-muted-foreground font-semibold tracking-wider">BASE64URL ENCODED</Label>
                    <Switch id="base64-switch" checked={isBase64Url} onCheckedChange={setIsBase64Url} />
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 font-mono text-sm text-chart-2">
                      <TerminalIcon className="size-4" />
                      <span>Secret</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                      <Input 
                        value={secret} 
                        onChange={(e) => setSecret(e.target.value)} 
                        placeholder="your-256-bit-secret"
                        className="font-mono"
                      />
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="encoder" className="flex-1 mt-4 data-[state=inactive]:hidden outline-none">
          <div className="grid h-full gap-2 lg:grid-cols-2">
            
            {/* LEFT COLUMN - INPUTS */}
            <div className="flex min-h-0 flex-col gap-6 px-2 pb-4">
              
              {/* ENCODER HEADER */}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Header</h2>
                <Card>
                   <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-destructive">JSON</span>
                      <span className="text-muted-foreground">Algorithm & Token Type</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                      <CodeEditor
                        value={encoderHeader}
                        onChange={setEncoderHeader}
                        className="border-0 bg-transparent flex-1"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm font-medium">
                    {encoderHeaderError ? (
                      <span className="text-destructive flex items-center gap-1"><ShieldAlertIcon className="size-4" /> {encoderHeaderError}</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1"><ShieldCheckIcon className="size-4" /> Valid JSON format</span>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* ENCODER PAYLOAD */}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Payload</h2>
                <Card>
                   <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-primary">JSON</span>
                      <span className="text-muted-foreground">Data Claims</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                      <CodeEditor
                        value={encoderPayload}
                        onChange={setEncoderPayload}
                        className="border-0 bg-transparent flex-1"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm font-medium">
                    {encoderPayloadError ? (
                      <span className="text-destructive flex items-center gap-1"><ShieldAlertIcon className="size-4" /> {encoderPayloadError}</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1"><ShieldCheckIcon className="size-4" /> Valid JSON format</span>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* ENCODER SECRET */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Signing Secret</h2>
                    <p className="text-xs text-muted-foreground">Enter the secret used to sign the JWT below:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="enc-base64-switch" className="text-xs text-muted-foreground font-semibold tracking-wider">BASE64URL ENCODED</Label>
                    <Switch id="enc-base64-switch" checked={isEncoderBase64Url} onCheckedChange={setIsEncoderBase64Url} />
                  </div>
                </div>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-sm text-chart-2">
                      <TerminalIcon className="size-4" />
                      <span>Secret</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                      <Input 
                        value={encoderSecret} 
                        onChange={(e) => setEncoderSecret(e.target.value)} 
                        placeholder="your-256-bit-secret"
                        className="font-mono"
                      />
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* RIGHT COLUMN - OUTPUT */}
            <div className="flex min-h-0 flex-col gap-2 px-2 pb-4">
              <h2 className="text-lg font-semibold">Encoded Token</h2>
              <Card className="flex-1 flex flex-col min-h-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                    <TerminalIcon className="size-4" />
                    <span>JSON Web Token (JWT)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => copyToken(generatedToken)}><CopyIcon /></Button>} />
                      <TooltipContent>Copy Token</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col relative">
                  <div className="flex-1 flex flex-col relative rounded-xl bg-muted/50 overflow-hidden">
                    <CodeEditor
                      value={generatedToken}
                      readOnly
                      language="none"
                      className="border-0 bg-transparent flex-1 focus-visible:ring-0 break-all whitespace-pre-wrap"
                      extensions={[jwtHighlightPlugin]}
                      basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="text-sm font-medium">
                  {generatedToken ? (
                     <span className="text-emerald-500 flex items-center gap-1"><ShieldCheckIcon className="size-4" /> Token Generated</span>
                  ) : (
                     <span className="text-destructive flex items-center gap-1"><ShieldAlertIcon className="size-4" /> Waiting for valid inputs...</span>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import * as React from "react"
import { CopyIcon } from "lucide-react"
import SparkMD5 from "spark-md5"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator } from "@/components/ui/item"
import { FieldGroup, Field, FieldLabel, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field"

// Utils
function arrayBufferToHex(buffer: ArrayBuffer, uppercase: boolean): string {
  const hex = Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return uppercase ? hex.toUpperCase() : hex
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
  return btoa(binary)
}

export function HashGeneratorPage() {
  const [inputText, setInputText] = React.useState("hello world")
  const [isUppercase, setIsUppercase] = React.useState(false)
  const [outputFormat, setOutputFormat] = React.useState<"hex" | "base64">("hex")
  
  const [hashes, setHashes] = React.useState([
    { name: "MD5", bits: 128, value: "" },
    { name: "SHA-1", bits: 160, value: "" },
    { name: "SHA-256", bits: 256, value: "" },
    { name: "SHA-384", bits: 384, value: "" },
    { name: "SHA-512", bits: 512, value: "" },
  ])

  React.useEffect(() => {
    let active = true

    const generateHashes = async () => {
      const encoder = new TextEncoder()
      const data = encoder.encode(inputText)
      
      let md5Result: string
      if (outputFormat === "base64") {
        md5Result = btoa(SparkMD5.hash(inputText, true))
      } else {
        md5Result = SparkMD5.hash(inputText)
        if (isUppercase) md5Result = md5Result.toUpperCase()
      }

      const newHashes = [
        { name: "MD5", bits: 128, value: md5Result }
      ]

      const processSha = async (algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", bits: number) => {
        try {
          const buffer = await crypto.subtle.digest(algo, data)
          let result = ""
          if (outputFormat === "base64") {
            result = arrayBufferToBase64(buffer)
          } else {
            result = arrayBufferToHex(buffer, isUppercase)
          }
          newHashes.push({ name: algo, bits, value: result })
        } catch (e) {
          console.error(e)
        }
      }

      await Promise.all([
        processSha("SHA-1", 160),
        processSha("SHA-256", 256),
        processSha("SHA-384", 384),
        processSha("SHA-512", 512),
      ])

      if (active) {
        newHashes.sort((a, b) => a.bits - b.bits)
        setHashes(newHashes)
      }
    }

    generateHashes()

    return () => { active = false }
  }, [inputText, isUppercase, outputFormat])

  const copyToClipboard = React.useCallback(async (text: string, label: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    toast.add({ type: "success", title: "Copiado", description: `${label} copiado al portapapeles.` })
  }, [])

  const inputBytes = new TextEncoder().encode(inputText).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Hash & Crypto Generator</h1>
        <p className="text-muted-foreground text-sm">
          Calcula hashes criptográficos en tiempo real (MD5, SHA) en múltiples formatos.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2" style={{ gridAutoRows: "1fr" }}>
        
        {/* LEFT CARD */}
        <Card className="flex flex-col min-h-130">
          <CardHeader className="shrink-0 flex flex-row justify-between items-center space-y-0">
             <div>
                <CardTitle>Entrada</CardTitle>
                <CardDescription>Se ejecuta en tu navegador.</CardDescription>
             </div>
             <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{inputBytes} bytes</span>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden gap-4">
            <Textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Introduce el texto aquí..."
              className="my-1 flex-1 resize-none font-mono text-sm overflow-y-auto"
            />
          </CardContent>
        </Card>

        {/* RIGHT CARD */}
        <Card className="flex flex-col min-h-130">
          <CardHeader className="shrink-0">
             <CardTitle>Resultados</CardTitle>
             <CardDescription>Configura y visualiza los hashes generados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden gap-6">
             
             {/* CONFIGURATION */}
             <FieldGroup className="shrink-0">
               <FieldLabel htmlFor="switch-uppercase">
                 <Field orientation="horizontal">
                   <FieldContent>
                     <FieldTitle>Mayúsculas</FieldTitle>
                     <FieldDescription>Convertir a formato HEX en mayúsculas.</FieldDescription>
                   </FieldContent>
                   <Switch
                     id="switch-uppercase"
                     checked={isUppercase}
                     onCheckedChange={setIsUppercase}
                     disabled={outputFormat !== "hex"}
                   />
                 </Field>
               </FieldLabel>

               <Field>
                 <FieldLabel>Formato de Salida</FieldLabel>
                 <ToggleGroup 
                    value={[outputFormat]} 
                    onValueChange={(v: string[]) => { if (v.length > 0) setOutputFormat(v[0] as "hex" | "base64") }}
                    className="justify-start w-full"
                 >
                   <ToggleGroupItem value="hex" className="flex-1">HEX</ToggleGroupItem>
                   <ToggleGroupItem value="base64" className="flex-1">BASE64</ToggleGroupItem>
                 </ToggleGroup>
               </Field>
             </FieldGroup>
             
             {/* HASHES LIST */}
             <div className="flex-1 overflow-y-auto -mx-2 px-2">
               <ItemGroup>
                 {hashes.map((hash, i) => (
                   <React.Fragment key={hash.name}>
                     {i > 0 && <ItemSeparator className="my-1" />}
                     <Item variant="muted" size="sm">
                       <div className="flex-none w-20 shrink-0">
                         <ItemTitle>{hash.name}</ItemTitle>
                         <ItemDescription className="text-xs">{hash.bits} bits</ItemDescription>
                       </div>
                       <ItemContent className="font-mono text-sm break-all">
                         {hash.value || <span className="opacity-50 font-sans font-normal text-muted-foreground">Generando...</span>}
                       </ItemContent>
                       <ItemActions>
                         <Tooltip>
                           <TooltipTrigger render={
                             <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(hash.value, hash.name)}>
                               <CopyIcon className="size-4" />
                             </Button>
                           } />
                           <TooltipContent>Copiar {hash.name}</TooltipContent>
                         </Tooltip>
                       </ItemActions>
                     </Item>
                   </React.Fragment>
                 ))}
               </ItemGroup>
             </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import * as React from "react"
import { CopyIcon } from "lucide-react"
import SparkMD5 from "spark-md5"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator } from "@/components/ui/item"
import { FieldGroup, Field, FieldLabel, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field"
import { useCopy } from "@/hooks/use-copy"
import { ToolHeader } from "@/components/shared/tool-header"
import { useToolState } from "@/hooks/use-tool-state"
import { parsers } from "@/lib/tool-state"

const TOOL = "hash-generator"
const FORMATS = ["hex", "base64"] as const
type OutputFormat = (typeof FORMATS)[number]

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
  const copy = useCopy()
  // The input may be a password: it stays out of the URL and of localStorage.
  const [inputText, setInputText] = useToolState(TOOL, "input", "hello world", {
    parse: parsers.string(),
    url: false,
    persist: false,
  })
  const [isUppercase, setIsUppercase] = useToolState(TOOL, "uppercase", false, { parse: parsers.boolean() })
  const [outputFormat, setOutputFormat] = useToolState<OutputFormat>(TOOL, "format", "hex", {
    parse: parsers.oneOf(FORMATS),
  })
  
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

  const inputBytes = React.useMemo(() => new TextEncoder().encode(inputText).length, [inputText])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ToolHeader
        url="/hash-generator"
        description="Calcula hashes MD5 y SHA en tiempo real, en hexadecimal o Base64."
      />

      <div className="grid gap-4 md:grid-cols-2">
        
        {/* LEFT CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Entrada</CardTitle>
            <CardDescription>Se procesa en tu navegador y no se guarda.</CardDescription>
            <CardAction>
              <Badge variant="secondary">{inputBytes} bytes</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Introduce el texto aquí..."
              aria-label="Texto a hashear"
              spellCheck={false}
              className="min-h-40 flex-1 resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* RIGHT CARD */}
        <Card>
          <CardHeader>
             <CardTitle>Resultados</CardTitle>
             <CardDescription>Configura y visualiza los hashes generados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
             
             {/* CONFIGURATION */}
             <FieldGroup className="shrink-0">
               <FieldLabel htmlFor="switch-uppercase">
                 <Field orientation="horizontal">
                   <FieldContent>
                     <FieldTitle>Mayúsculas</FieldTitle>
                     <FieldDescription>Solo aplica al formato hexadecimal.</FieldDescription>
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
                 <FieldLabel>Formato de salida</FieldLabel>
                 <ToggleGroup 
                    value={[outputFormat]} 
                    onValueChange={(v: string[]) => { if (v.length > 0) setOutputFormat(v[0] as OutputFormat) }}
                    className="justify-start w-full"
                 >
                   <ToggleGroupItem value="hex" className="flex-1">HEX</ToggleGroupItem>
                   <ToggleGroupItem value="base64" className="flex-1">BASE64</ToggleGroupItem>
                 </ToggleGroup>
               </Field>
             </FieldGroup>
             
             {/* HASHES LIST */}
             <div>
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
                             <Button variant="ghost" size="icon-sm" aria-label={`Copiar ${hash.name}`} disabled={!hash.value} onClick={() => copy(hash.value, `${hash.name} copiado al portapapeles.`)}>
                               <CopyIcon />
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

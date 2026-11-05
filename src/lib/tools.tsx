import {
  Binary,
  Braces,
  CalendarClock,
  Fingerprint,
  Hash,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

export type ToolCategory = "data" | "generators" | "security"

export interface ToolInfo {
  title: string
  description: string
  url:
    | "/json-formatter"
    | "/jwt-decoder"
    | "/uuid-generator"
    | "/hash-generator"
    | "/bcrypt-generator"
    | "/base64-converter"
    | "/cron-parser"
  icon: LucideIcon
  category: ToolCategory
  /**
   * The tool handles secrets (passwords, tokens, keys): its inputs never go to
   * the URL nor to localStorage, only its options do.
   */
  sensitive: boolean
}

export const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: "data", label: "Datos y formatos" },
  { id: "generators", label: "Generadores" },
  { id: "security", label: "Seguridad" },
]

export const TOOLS: ToolInfo[] = [
  {
    title: "JSON Formatter",
    description: "Formatea, minifica y valida JSON en tiempo real",
    url: "/json-formatter",
    icon: Braces,
    category: "data",
    sensitive: false,
  },
  {
    title: "Base64 Converter",
    description: "Codifica y decodifica Base64 con soporte UTF-8",
    url: "/base64-converter",
    icon: Binary,
    category: "data",
    sensitive: false,
  },
  {
    title: "Cron Parser",
    description: "Traduce expresiones cron y calcula próximas ejecuciones",
    url: "/cron-parser",
    icon: CalendarClock,
    category: "data",
    sensitive: false,
  },
  {
    title: "UUID Generator",
    description: "Genera UUIDs v1, v4, v6 y v7 en lote",
    url: "/uuid-generator",
    icon: Hash,
    category: "generators",
    sensitive: false,
  },
  {
    title: "Hash Generator",
    description: "Calcula hashes MD5 y SHA en hex o Base64",
    url: "/hash-generator",
    icon: Fingerprint,
    category: "generators",
    sensitive: true,
  },
  {
    title: "JWT Decoder",
    description: "Decodifica, verifica y firma tokens JWT",
    url: "/jwt-decoder",
    icon: ShieldCheck,
    category: "security",
    sensitive: true,
  },
  {
    title: "Bcrypt Generator",
    description: "Genera y verifica hashes bcrypt",
    url: "/bcrypt-generator",
    icon: LockKeyhole,
    category: "security",
    sensitive: true,
  },
]

export function findTool(pathname: string): ToolInfo | undefined {
  return TOOLS.find((tool) => pathname === tool.url || pathname.endsWith(tool.url))
}

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
}

export const TOOLS: ToolInfo[] = [
  {
    title: "JSON Formatter",
    description: "Formatea y valida JSON en tiempo real",
    url: "/json-formatter",
    icon: Braces,
  },
  {
    title: "JWT Decoder",
    description: "Decodifica y verifica tokens JWT",
    url: "/jwt-decoder",
    icon: ShieldCheck,
  },
  {
    title: "UUID Generator",
    description: "Genera UUIDs en distintas versiones",
    url: "/uuid-generator",
    icon: Hash,
  },
  {
    title: "Hash Generator",
    description: "Calcula hashes MD5 y SHA",
    url: "/hash-generator",
    icon: Fingerprint,
  },
  {
    title: "Bcrypt Generator",
    description: "Genera y verifica hashes bcrypt",
    url: "/bcrypt-generator",
    icon: LockKeyhole,
  },
  {
    title: "Base64 Converter",
    description: "Codifica y decodifica Base64",
    url: "/base64-converter",
    icon: Binary,
  },
  {
    title: "Cron Parser",
    description: "Traduce expresiones Cron",
    url: "/cron-parser",
    icon: CalendarClock,
  },
]

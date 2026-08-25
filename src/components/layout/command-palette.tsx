import * as React from "react"
import { Braces, Hash, ShieldCheck, Fingerprint, LockKeyhole, Binary, CalendarClock } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Busca una herramienta..." />
        <CommandList>
          <CommandEmpty>No se han encontrado resultados.</CommandEmpty>
          <CommandGroup heading="Herramientas">
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/json-formatter" }))}
            >
              <Braces className="mr-2 h-4 w-4" />
              <span>JSON Formatter</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/jwt-decoder" }))}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>JWT Decoder</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/uuid-generator" }))}
            >
              <Hash className="mr-2 h-4 w-4" />
              <span>UUID Generator</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/hash-generator" }))}
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              <span>Hash Generator</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/bcrypt-generator" }))}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              <span>Bcrypt Generator</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/base64-converter" }))}
            >
              <Binary className="mr-2 h-4 w-4" />
              <span>Base64 Converter</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate({ to: "/cron-parser" }))}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              <span>Cron Parser</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

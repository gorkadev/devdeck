import * as React from "react"
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
import { TOOLS } from "@/lib/tools"

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
            {TOOLS.map((tool) => (
              <CommandItem
                key={tool.url}
                onSelect={() => runCommand(() => navigate({ to: tool.url }))}
              >
                <tool.icon className="mr-2 h-4 w-4" />
                <span>{tool.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

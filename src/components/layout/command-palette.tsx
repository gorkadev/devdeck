import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useRecentTools } from "@/lib/recent-tools"
import { CATEGORIES, TOOLS, type ToolInfo } from "@/lib/tools"

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

/** The ⌘K / Ctrl K hint, matching the visitor's platform. */
export function SearchShortcut() {
  // Touch devices have no keyboard shortcut to advertise.
  return (
    <KbdGroup className="pointer-coarse:hidden">
      <Kbd>{IS_MAC ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}

const CommandPaletteContext =React.createContext<(() => void) | null>(null)

/** Opens the command palette from anywhere inside `CommandPaletteProvider`. */
export function useOpenCommandPalette() {
  const open = React.useContext(CommandPaletteContext)
  if (!open) throw new Error("useOpenCommandPalette must be used within CommandPaletteProvider")
  return open
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const recent = useRecentTools()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const openPalette = React.useCallback(() => setOpen(true), [])

  const go = (tool: ToolInfo) => {
    setOpen(false)
    navigate({ to: tool.url })
  }

  const renderItem = (tool: ToolInfo, group: string) => (
    <CommandItem
      key={`${group}-${tool.url}`}
      value={`${group} ${tool.title} ${tool.description}`}
      onSelect={() => go(tool)}
    >
      <tool.icon />
      <span>{tool.title}</span>
      <span className="ml-auto hidden truncate text-xs text-muted-foreground sm:inline">
        {tool.description}
      </span>
    </CommandItem>
  )

  return (
    <CommandPaletteContext.Provider value={openPalette}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Buscar herramienta"
        description="Escribe para filtrar las herramientas de DevDeck"
      >
        <Command>
          <CommandInput placeholder="Busca una herramienta..." />
          <CommandList>
            <CommandEmpty>No se han encontrado resultados.</CommandEmpty>
            {recent.length > 0 && (
              <CommandGroup heading="Recientes">
                {recent.map((tool) => renderItem(tool, "recent"))}
              </CommandGroup>
            )}
            {CATEGORIES.map((category) => (
              <CommandGroup key={category.id} heading={category.label}>
                {TOOLS.filter((tool) => tool.category === category.id).map((tool) =>
                  renderItem(tool, category.id)
                )}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  )
}

import type { ReactNode } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRightIcon, HistoryIcon, Link2Icon, LockIcon, SearchIcon, ShieldCheckIcon } from "lucide-react"

import { SearchShortcut, useOpenCommandPalette } from "@/components/layout/command-palette"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecentTools } from "@/lib/recent-tools"
import { CATEGORIES, TOOLS, type ToolInfo } from "@/lib/tools"

export const Route = createFileRoute("/")({
  component: Index,
})

const HIGHLIGHTS = [
  {
    icon: ShieldCheckIcon,
    title: "Privado por diseño",
    description: "Todo se ejecuta en tu navegador.",
  },
  {
    icon: Link2Icon,
    title: "Enlaces compartibles",
    description: "La configuración vive en la URL.",
  },
  {
    icon: HistoryIcon,
    title: "Retoma donde lo dejaste",
    description: "Tu trabajo se guarda en este dispositivo.",
  },
]

function Index() {
  const openCommandPalette = useOpenCommandPalette()
  const recent = useRecentTools()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 py-2 sm:py-8">
      <section className="flex flex-col items-start gap-5">
        <Badge variant="outline">{TOOLS.length} herramientas · sin registro</Badge>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Herramientas para desarrolladores, sin salir del navegador
          </h1>
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Formatea, decodifica, genera y verifica. Rápido, privado y listo para cuando vuelvas.
          </p>
        </div>
        <Button size="lg" variant="outline" onClick={openCommandPalette} className="w-full sm:w-72">
          <SearchIcon data-icon="inline-start" />
          <span className="flex-1 text-left text-muted-foreground">Buscar herramienta...</span>
          <SearchShortcut />
        </Button>
        <ul className="grid w-full gap-4 border-t pt-5 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>Continúa donde lo dejaste</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((tool) => (
              <Link
                key={tool.url}
                to={tool.url}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3 text-sm shadow-xs transition-[background-color,transform] duration-150 ease-out outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                <ToolIcon tool={tool} size="sm" />
                <span className="truncate font-medium">{tool.title}</span>
                <ArrowUpRightIcon className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {CATEGORIES.map((category) => (
        <section key={category.id} className="flex flex-col gap-3">
          <SectionLabel>{category.label}</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((tool) => tool.category === category.id).map((tool) => (
              <ToolCard key={tool.url} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-medium text-muted-foreground">{children}</h2>
}

function ToolIcon({ tool, size = "default" }: { tool: ToolInfo; size?: "default" | "sm" }) {
  return (
    <div
      className={
        size === "sm"
          ? "flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background"
          : "flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-xs"
      }
    >
      <tool.icon className="size-4" />
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolInfo }) {
  return (
    <Card className="group relative transition-[box-shadow,transform] duration-150 ease-out focus-within:ring-2 focus-within:ring-ring hover:shadow-md hover:ring-foreground/15 has-active:scale-[0.99]">
      <CardHeader>
        <div className="mb-3 flex items-start justify-between">
          <ToolIcon tool={tool} />
          <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </div>
        <CardTitle>
          {/* Stretched link: the whole card is clickable, but only the title is announced. */}
          <Link to={tool.url} className="outline-none after:absolute after:inset-0 after:content-['']">
            {tool.title}
          </Link>
        </CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        {tool.sensitive ? (
          <Badge variant="secondary">
            <LockIcon data-icon="inline-start" />
            No guarda datos
          </Badge>
        ) : (
          <Badge variant="secondary">
            <HistoryIcon data-icon="inline-start" />
            Guarda tu progreso
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}

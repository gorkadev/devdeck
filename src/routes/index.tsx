import { createFileRoute, Link } from "@tanstack/react-router"
import { TOOLS } from "@/lib/tools"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Bienvenido a DevDeck</h2>
        <p className="text-muted-foreground text-lg">
          Herramientas para desarrolladores que se ejecutan en tu navegador.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.url}
            to={tool.url}
            className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <tool.icon className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{tool.title}</span>
              <span className="text-sm text-muted-foreground">{tool.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

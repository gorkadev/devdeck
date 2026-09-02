import { createFileRoute, Link } from "@tanstack/react-router"
import { TOOLS } from "@/lib/tools"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
          <Card
            key={tool.url}
            className="transition-colors hover:bg-accent hover:ring-foreground/20 focus-within:ring-2 focus-within:ring-ring"
          >
            <Link
              to={tool.url}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardHeader>
                <tool.icon className="size-5 text-muted-foreground transition-colors group-hover/card:text-foreground" />
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

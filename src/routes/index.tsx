import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-semibold tracking-tight">Bienvenido a DevDeck</h2>
      <p className="text-muted-foreground text-lg">
        Selecciona una herramienta en el menú lateral para comenzar.
      </p>
    </div>
  )
}

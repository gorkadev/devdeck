import { createFileRoute } from "@tanstack/react-router"
import { HashGeneratorPage } from "@/features/hash-generator/page"

export const Route = createFileRoute("/hash-generator")({
  component: HashGeneratorPage,
})

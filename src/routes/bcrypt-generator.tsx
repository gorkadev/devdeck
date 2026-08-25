import { createFileRoute } from "@tanstack/react-router"
import { BcryptGeneratorPage } from "@/features/bcrypt-generator/page"

export const Route = createFileRoute("/bcrypt-generator")({
  component: BcryptGeneratorPage,
})

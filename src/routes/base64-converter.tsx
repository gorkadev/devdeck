import { createFileRoute } from "@tanstack/react-router"
import { Base64ConverterPage } from "@/features/base64-converter/page"

export const Route = createFileRoute("/base64-converter")({
  component: Base64ConverterPage,
})

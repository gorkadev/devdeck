import { createFileRoute } from "@tanstack/react-router"
import { CronParserPage } from "@/features/cron-parser/page"

export const Route = createFileRoute("/cron-parser")({
  component: CronParserPage,
})

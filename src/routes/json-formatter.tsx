import { createFileRoute } from '@tanstack/react-router'
import { JsonFormatterPage } from '@/features/json-formatter/page'

export const Route = createFileRoute('/json-formatter')({
  component: JsonFormatterPage,
})

import { createFileRoute } from '@tanstack/react-router'
import { UuidGeneratorPage } from '@/features/uuid-generator/page'

export const Route = createFileRoute('/uuid-generator')({
  component: UuidGeneratorPage,
})

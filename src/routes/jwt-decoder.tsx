import { createFileRoute } from '@tanstack/react-router'
import { JwtDecoderPage } from '@/features/jwt-decoder/page'

export const Route = createFileRoute('/jwt-decoder')({
  component: JwtDecoderPage,
})

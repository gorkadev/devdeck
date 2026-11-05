import * as React from "react"
import { LockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TOOLS, type ToolInfo } from "@/lib/tools"
import { cn } from "@/lib/utils"

interface ToolHeaderProps {
  url: ToolInfo["url"]
  /** Longer description than the catalogue one, when the page needs it. */
  description?: string
  /** Primary page actions, aligned right on wide screens. */
  actions?: React.ReactNode
  className?: string
}

/** Title block shared by every tool page, driven by the tool catalogue. */
export function ToolHeader({ url, description, actions, className }: ToolHeaderProps) {
  const tool = TOOLS.find((t) => t.url === url)
  if (!tool) return null

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs">
          <tool.icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{tool.title}</h1>
            {tool.sensitive && (
              <Tooltip>
                <TooltipTrigger render={<Badge variant="secondary" />}>
                  <LockIcon data-icon="inline-start" />
                  Privado
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                  Lo que escribas aquí no se guarda ni aparece en la URL. Solo se recuerdan las
                  opciones.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description ?? tool.description}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

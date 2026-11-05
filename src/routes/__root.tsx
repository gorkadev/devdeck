import * as React from "react"
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { SearchIcon } from "lucide-react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  CommandPaletteProvider,
  useOpenCommandPalette,
} from "@/components/layout/command-palette"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { recordToolVisit } from "@/lib/recent-tools"
import { findTool } from "@/lib/tools"

const BASE_TITLE = "DevDeck"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 68)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <CommandPaletteProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex flex-1 flex-col p-4 sm:p-6">
              <Outlet />
            </main>
          </SidebarInset>
          <RouteEffects />
        </CommandPaletteProvider>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AppHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const tool = findTool(pathname)
  const openCommandPalette = useOpenCommandPalette()

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 rounded-t-[inherit] border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {tool ? (
            <>
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink render={<Link to="/" />}>DevDeck</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">{tool.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Inicio</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Buscar herramienta"
          onClick={openCommandPalette}
        >
          <SearchIcon />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}

/** Keeps the tab title and the "recent tools" list in step with the route. */
function RouteEffects() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  React.useEffect(() => {
    const tool = findTool(pathname)
    document.title = tool ? `${tool.title} · ${BASE_TITLE}` : `${BASE_TITLE} · Herramientas para desarrolladores`
    if (tool) recordToolVisit(tool)
  }, [pathname])

  return null
}

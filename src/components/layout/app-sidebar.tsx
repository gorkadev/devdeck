import { Link, useRouterState } from "@tanstack/react-router"
import { CodeIcon, SearchIcon, ShieldCheckIcon } from "lucide-react"

import { SearchShortcut, useOpenCommandPalette } from "@/components/layout/command-palette"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CATEGORIES, TOOLS } from "@/lib/tools"

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const openCommandPalette = useOpenCommandPalette()
  const { isMobile, setOpenMobile } = useSidebar()

  // On mobile the sidebar is a sheet: close it once the user picks a tool.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="gap-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" onClick={closeOnMobile} />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CodeIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">DevDeck</span>
                <span className="truncate text-xs text-muted-foreground">
                  Herramientas para devs
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <button
          type="button"
          onClick={() => {
            closeOnMobile()
            openCommandPalette()
          }}
          className="flex h-9 w-full items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <SearchIcon className="size-4" />
          <span className="flex-1 text-left">Buscar...</span>
          <SearchShortcut />
        </button>
      </SidebarHeader>

      <SidebarContent>
        {CATEGORIES.map((category) => (
          <SidebarGroup key={category.id}>
            <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {TOOLS.filter((tool) => tool.category === category.id).map((tool) => (
                  <SidebarMenuItem key={tool.url}>
                    <SidebarMenuButton
                      isActive={pathname.endsWith(tool.url)}
                      render={<Link to={tool.url} onClick={closeOnMobile} />}
                    >
                      <tool.icon />
                      <span>{tool.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-start gap-3 rounded-lg border bg-background p-3 shadow-xs">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">100% en tu navegador</span>
            <span className="text-xs text-muted-foreground">
              Nada se envía a ningún servidor. Tu progreso se guarda en este dispositivo.
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

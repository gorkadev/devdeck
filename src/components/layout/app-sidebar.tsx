import { Link, useRouterState } from "@tanstack/react-router"
import { CodeIcon, SearchIcon } from "lucide-react"

import { SearchShortcut, useOpenCommandPalette } from "@/components/layout/command-palette"
import {
  Sidebar,
  SidebarContent,
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
    <Sidebar variant="floating">
      <SidebarHeader>
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

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-muted-foreground"
              onClick={() => {
                closeOnMobile()
                openCommandPalette()
              }}
            >
              <SearchIcon />
              <span>Buscar</span>
              <span className="ml-auto">
                <SearchShortcut />
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
    </Sidebar>
  )
}

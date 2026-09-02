import { Link } from "@tanstack/react-router"
import { Code } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TOOLS } from "@/lib/tools"

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Code className="h-5 w-5" />
          <span>DevDeck</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOOLS.map((tool) => (
                <SidebarMenuItem key={tool.url}>
                  <SidebarMenuButton render={<Link to={tool.url} />}>
                    <tool.icon />
                    <span>{tool.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

import { Link } from "@tanstack/react-router"
import { Code, Hash, Braces, ShieldCheck, Fingerprint, LockKeyhole, Binary, CalendarClock } from "lucide-react"

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

const tools = [
  {
    title: "JSON Formatter",
    url: "/json-formatter" as const,
    icon: Braces,
  },
  {
    title: "JWT Decoder",
    url: "/jwt-decoder" as const,
    icon: ShieldCheck,
  },
  {
    title: "UUID Generator",
    url: "/uuid-generator" as const,
    icon: Hash,
  },
  {
    title: "Hash Generator",
    url: "/hash-generator" as const,
    icon: Fingerprint,
  },
  {
    title: "Bcrypt Generator",
    url: "/bcrypt-generator" as const,
    icon: LockKeyhole,
  },
  {
    title: "Base64 Converter",
    url: "/base64-converter" as const,
    icon: Binary,
  },
  {
    title: "Cron Parser",
    url: "/cron-parser" as const,
    icon: CalendarClock,
  },
]

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
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton 
                    render={<Link to={tool.url} />}
                  >
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

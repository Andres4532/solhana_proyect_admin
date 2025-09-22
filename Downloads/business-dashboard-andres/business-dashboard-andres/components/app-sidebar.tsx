"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { useAuth } from "../src/contexts/AuthContext"
import { useNavigation } from "../src/contexts/NavigationContext"
import {
  BarChart3,
  Building2,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

export function AppSidebar() {
  const { activeSection, setActiveSection } = useNavigation()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      description: "Manage your products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      description: "Track and manage orders",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      description: "Customer database",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar,
      description: "Scheduled orders",
    },
    {
      id: "moto",
      label: "Moto Delivery",
      icon: MapPin,
      description: "Delivery management",
    },
    {
      id: "history",
      label: "History",
      icon: FileText,
      description: "Order history",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Business settings",
    },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Business Dashboard
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLogout}>
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}

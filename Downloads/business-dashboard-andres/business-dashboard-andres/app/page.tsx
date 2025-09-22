"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../src/contexts/AuthContext"
import { SidebarProvider } from "../components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { DashboardContent } from "../components/dashboard-content"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  )
}

"use client"

import { CategoriesProvider } from "../../src/contexts/CategoriesContext"
import { PublicDashboard } from "../../components/public-dashboard"

export default function CatalogoPage() {
  return (
    <CategoriesProvider>
      <PublicDashboard />
    </CategoriesProvider>
  )
}

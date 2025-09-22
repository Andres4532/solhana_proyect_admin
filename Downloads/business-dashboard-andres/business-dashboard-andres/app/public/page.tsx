"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PublicPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al catálogo público
    router.push('/catalogo')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🍕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pizza Kitchen</h1>
        <p className="text-gray-600">Redirigiendo al catálogo...</p>
      </div>
    </div>
  )
}

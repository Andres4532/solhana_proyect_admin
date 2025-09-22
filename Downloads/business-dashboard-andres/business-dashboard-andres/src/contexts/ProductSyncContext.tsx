"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Product } from '../services/productsAPI'
import { ProductVariable } from '../services/productVariablesAPI'

interface ProductSyncContextType {
  // Estado de sincronización
  refreshTrigger: number
  triggerRefresh: () => void
  
  // Producto actual seleccionado
  currentProduct: Product | null
  setCurrentProduct: (product: Product | null) => void
  
  // Variables del producto actual
  currentVariables: ProductVariable[]
  setCurrentVariables: (variables: ProductVariable[]) => void
  
  // Forzar recarga de variables
  refreshVariables: (productId: string) => void
}

const ProductSyncContext = createContext<ProductSyncContextType | undefined>(undefined)

export function ProductSyncProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentVariables, setCurrentVariables] = useState<ProductVariable[]>([])

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const refreshVariables = useCallback((productId: string) => {
    // Esta función se puede expandir para hacer una llamada API
    triggerRefresh()
  }, [triggerRefresh])

  const value: ProductSyncContextType = {
    refreshTrigger,
    triggerRefresh,
    currentProduct,
    setCurrentProduct,
    currentVariables,
    setCurrentVariables,
    refreshVariables
  }

  return (
    <ProductSyncContext.Provider value={value}>
      {children}
    </ProductSyncContext.Provider>
  )
}

export function useProductSync() {
  const context = useContext(ProductSyncContext)
  if (context === undefined) {
    throw new Error('useProductSync must be used within a ProductSyncProvider')
  }
  return context
}


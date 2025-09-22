"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { categoriesAPI, Category, CreateCategoryData, UpdateCategoryData } from '../services/categoriesAPI'
import { toast } from 'react-hot-toast'

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
  error: string | null
  createCategory: (data: CreateCategoryData) => Promise<{ success: boolean; data?: Category; error?: string }>
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<{ success: boolean; data?: Category; error?: string }>
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>
  toggleCategoryStatus: (id: string) => Promise<{ success: boolean; data?: Category; error?: string }>
  refreshCategories: () => Promise<void>
  getActiveCategories: () => Category[]
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider')
  }
  return context
}

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoriesAPI.getAll()
      setCategories(Array.isArray(data) ? data : [])
      console.log('🔄 Context: Categorías cargadas:', data.length)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al cargar categorías'
      setError(message)
      toast.error(message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new category
  const createCategory = useCallback(async (categoryData: CreateCategoryData) => {
    try {
      setLoading(true)
      setError(null)
      const newCategory = await categoriesAPI.create(categoryData)
      
      // Actualizar el estado de forma más explícita
      setCategories(prev => {
        console.log('🔄 Context: Estado anterior:', prev.length, 'categorías')
        const newState = [...prev, newCategory]
        console.log('🔄 Context: Nuevo estado:', newState.length, 'categorías')
        return newState
      })
      
      toast.success('Categoría creada exitosamente')
      return { success: true, data: newCategory }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al crear categoría'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update category
  const updateCategory = useCallback(async (id: string, categoryData: UpdateCategoryData) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedCategory = await categoriesAPI.update(id, categoryData)
      
      setCategories(prev => {
        const newState = prev.map(cat => {
          if (cat._id === id) {
            return updatedCategory
          }
          return cat
        })
        return newState
      })
      
      toast.success('Categoría actualizada exitosamente')
      return { success: true, data: updatedCategory }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al actualizar categoría'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await categoriesAPI.delete(id)
      setCategories(prev => prev.filter(cat => cat._id !== id))
      toast.success('Categoría eliminada exitosamente')
      return { success: true }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al eliminar categoría'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle category status
  const toggleCategoryStatus = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const category = categories.find(cat => cat._id === id)
      if (!category) {
        return { success: false, error: 'Categoría no encontrada' }
      }
      
      const newStatus = category.status === 1 ? 0 : 1
      const updatedCategory = await categoriesAPI.toggleStatus(id, newStatus)
      
      setCategories(prev => {
        const newState = prev.map(cat => {
          if (cat._id === id) {
            return updatedCategory
          }
          return cat
        })
        return newState
      })
      
      const statusText = newStatus === 1 ? 'activada' : 'desactivada'
      toast.success(`Categoría ${statusText} exitosamente`)
      return { success: true, data: updatedCategory }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al cambiar estado de categoría'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [categories])

  // Get active categories only
  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.status === 1)
  }, [categories])

  // Refresh categories
  const refreshCategories = useCallback(async () => {
    console.log('🔄 Context: Forzando refresh de categorías')
    await fetchCategories()
  }, [fetchCategories])

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refreshCategories,
    getActiveCategories,
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

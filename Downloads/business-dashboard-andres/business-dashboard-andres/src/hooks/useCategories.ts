import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI, Category, CreateCategoryData, UpdateCategoryData } from '../services/categoriesAPI';
import { toast } from 'react-hot-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); // Cambiar a true inicialmente
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll();
      setCategories(Array.isArray(data) ? data : []);
         } catch (err: unknown) {
       const error = err as { response?: { data?: { message?: string } } };
       const message = error.response?.data?.message || 'Error al cargar categorías';
       setError(message);
       toast.error(message);
       setCategories([]); // Asegurar que siempre sea un array
     } finally {
      setLoading(false);
    }
  }, []);

  // Create new category
  const createCategory = useCallback(async (categoryData: CreateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoriesAPI.create(categoryData);
      
      // Actualizar el estado de forma más explícita
      setCategories(prev => {
        console.log('🔄 Hook: Estado anterior:', prev.length, 'categorías');
        const newState = [...prev, newCategory];
        console.log('🔄 Hook: Nuevo estado:', newState.length, 'categorías');
        return newState;
      });
      
      toast.success('Categoría creada exitosamente');
      return { success: true, data: newCategory };
         } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al crear categoría';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update category
  const updateCategory = useCallback(async (id: string, categoryData: UpdateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Hook: Iniciando updateCategory para ID:', id);
      console.log('🔄 Hook: Datos de actualización:', categoryData);
      console.log('🔄 Hook: Estado actual de categorías:', categories);
      
      const updatedCategory = await categoriesAPI.update(id, categoryData);
      console.log('✅ Hook: Respuesta de la API updateCategory:', updatedCategory);
      
      // Verificar que la respuesta sea válida
      if (!updatedCategory || typeof updatedCategory !== 'object') {
        console.error('❌ Hook: Respuesta inválida de la API en updateCategory:', updatedCategory);
        throw new Error('Respuesta inválida de la API');
      }
      
      // Actualizar el estado local
      setCategories(prev => {
        console.log('🔄 Hook: Estado anterior en updateCategory:', prev);
        const newState = prev.map(cat => {
          if (cat._id === id) {
            console.log('✅ Hook: Actualizando categoría:', cat._id, 'con:', updatedCategory);
            return updatedCategory;
          }
          return cat;
        });
        console.log('✅ Hook: Nuevo estado en updateCategory:', newState);
        return newState;
      });
      
      toast.success('Categoría actualizada exitosamente');
      console.log('✅ Hook: Categoría actualizada exitosamente');
      return { success: true, data: updatedCategory };
    } catch (err: unknown) {
      console.error('❌ Hook: Error en updateCategory:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al actualizar categoría';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      toast.success('Categoría eliminada exitosamente');
      return { success: true };
         } catch (err: unknown) {
       const error = err as { response?: { data?: { message?: string } } };
       const message = error.response?.data?.message || 'Error al eliminar categoría';
       setError(message);
       toast.error(message);
       return { success: false, error: message };
     } finally {
      setLoading(false);
    }
  }, []);

  // Toggle category status
  const toggleCategoryStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Hook: Iniciando toggleCategoryStatus');
      console.log('🔄 Hook: ID de categoría:', id);
      console.log('🔄 Hook: Estado actual de categorías:', categories);
      
      const category = categories.find(cat => cat._id === id);
      if (!category) {
        console.error('❌ Hook: Categoría no encontrada:', id);
        return { success: false, error: 'Categoría no encontrada' };
      }
      
      const newStatus = category.status === 1 ? 0 : 1;
      console.log('🔄 Hook: Cambiando estado de:', category.status, 'a:', newStatus);
      
      const updatedCategory = await categoriesAPI.toggleStatus(id, newStatus);
      console.log('✅ Hook: Respuesta de la API:', updatedCategory);
      console.log('✅ Hook: Tipo de respuesta:', typeof updatedCategory);
      
      // Verificar que la respuesta sea válida
      if (!updatedCategory || typeof updatedCategory !== 'object') {
        console.error('❌ Hook: Respuesta inválida de la API:', updatedCategory);
        throw new Error('Respuesta inválida de la API');
      }
      
      // Actualizar el estado local
      setCategories(prev => {
        console.log('🔄 Hook: Estado anterior en toggle:', prev);
        const newState = prev.map(cat => {
          if (cat._id === id) {
            console.log('✅ Hook: Actualizando estado de categoría:', cat._id, 'con:', updatedCategory);
            return updatedCategory;
          }
          return cat;
        });
        console.log('✅ Hook: Nuevo estado en toggle:', newState);
        return newState;
      });
      
      const statusText = newStatus === 1 ? 'activada' : 'desactivada';
      toast.success(`Categoría ${statusText} exitosamente`);
      return { success: true, data: updatedCategory };
    } catch (err: unknown) {
      console.error('❌ Hook: Error en toggleCategoryStatus:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al cambiar estado de categoría';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Get category by ID
  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat._id === id);
  }, [categories]);

  // Get active categories only
  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.status === 1);
  }, [categories]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Función para forzar refresh de categorías
  const refreshCategories = useCallback(async () => {
    console.log('🔄 Hook: Forzando refresh de categorías');
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategoryById,
    getActiveCategories,
  };
};

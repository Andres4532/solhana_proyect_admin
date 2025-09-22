import { api } from './api';

export interface Category {
  _id: string;
  categoryName: string;
  categoryCode: string;
  description: string;
  waitingTime: string;
  status: number; // 0 = inactive, 1 = active
  url: string | null;
  companyID: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  categoryName: string;
  description?: string;
  waitingTime?: string;
  branchId?: string;
}

export interface UpdateCategoryData {
  categoryName?: string;
  description?: string;
  waitingTime?: string;
  branchId?: string;
}

export const categoriesAPI = {
  // Get all categories for the current company
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    console.log('🚀 API: update categoría llamado con:', { id, data });
    try {
      const response = await api.put(`/categories/${id}`, data);
      console.log('✅ API: Respuesta completa de update:', response.data);
      
      // El backend podría devolver { message, category } o directamente la categoría
      if (response.data && response.data.category) {
        console.log('✅ API: Categoría extraída de update:', response.data.category);
        return response.data.category;
      } else {
        console.log('⚠️ API: No se encontró category en update, devolviendo respuesta completa');
        return response.data;
      }
    } catch (error) {
      console.error('❌ API: Error en update categoría:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Toggle category status
  toggleStatus: async (id: string, newStatus: number): Promise<Category> => {
    console.log('🚀 API: toggleStatus llamado con:', { id, newStatus });
    try {
      const response = await api.put(`/categories/${id}`, { status: newStatus });
      console.log('✅ API: Respuesta completa:', response.data);
      
      // El backend devuelve { message, category }
      if (response.data.category) {
        console.log('✅ API: Categoría extraída:', response.data.category);
        return response.data.category;
      }
      
      // Fallback: si no hay category, devolver la respuesta completa
      console.log('⚠️ API: No se encontró category en la respuesta, devolviendo respuesta completa');
      return response.data;
    } catch (error) {
      console.error('❌ API: Error en toggleStatus:', error);
      throw error;
    }
  }
};

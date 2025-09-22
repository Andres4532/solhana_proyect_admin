import { api } from './api';

export interface Product {
  _id: string;
  productCode: string;
  name: string;
  description: string;
  url: string | null;
  status: number; // 0 = inactive, 1 = active
  visibleItem: boolean;
  pricing: number | string;
  categoryProductId: string | { _id: string; categoryName: string }; // Puede ser string o objeto populado
  identifier: string;
  variables: string[]; // Array of ProductVariable IDs
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  pricing: number | string;
  categoryProductId: string;
  description?: string;
  branchId?: string;
  visibleItem?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  pricing?: number | string;
  visibleItem?: boolean;
  categoryProductId?: string;
  status?: number;
  url?: string;
}

export const productsAPI = {
  // Get all products for the current company
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get single product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  create: async (data: CreateProductData & { url?: string }): Promise<Product> => {
    console.log('🚀 API: create producto llamado con datos:', data);
    
    try {
      // Crear producto con URL de imagen
      console.log('📝 API: Creando producto con URL de imagen...');
      const productData = {
        ...data,
        pricing: data.pricing === "" ? 0 : Number(data.pricing)
      };
      const response = await api.post('/products', productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ API: Producto creado:', response.data);
      return response.data.product || response.data;
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: any; status?: number } };
      console.error('❌ API: Error al crear producto:', err);
      console.error('❌ API: Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      console.error('❌ API: Respuesta completa del backend:', err.response?.data);
      if (err.response?.data?.errors) {
        console.error('❌ API: Errores de validación:', err.response.data.errors);
        err.response.data.errors.forEach((error: any, index: number) => {
          console.error(`❌ API: Error ${index + 1}:`, error);
        });
      }
      console.error('❌ API: Error completo:', err);
      throw error;
    }
  },

  // Update product
  update: async (id: string, data: UpdateProductData): Promise<Product> => {
    try {
      const updateData = {
        ...data,
        pricing: data.pricing === "" ? 0 : Number(data.pricing)
      };
      const response = await api.put(`/products/${id}`, updateData, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // El backend devuelve {message: 'Product updated successfully', product: {...}}
      if (response.data && response.data.product) {
        return response.data.product;
      } else {
        return response.data;
      }
    } catch (error: unknown) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Toggle product status
  toggleStatus: async (id: string, newStatus: number): Promise<Product> => {
    const response = await api.put(`/products/${id}`, { status: newStatus });
    return response.data;
  },

  // Toggle product visibility
  toggleVisibility: async (id: string, visibleItem: boolean): Promise<Product> => {
    console.log('🚀 API: toggleVisibility llamado con:', { id, visibleItem });
    try {
      const response = await api.put(`/products/${id}`, { visibleItem });
      console.log('✅ API: toggleVisibility respuesta completa:', response.data);
      
      // El backend podría devolver {message: '...', product: {...}} o directamente el producto
      if (response.data && response.data.product) {
        console.log('✅ API: Producto extraído de toggleVisibility:', response.data.product);
        return response.data.product;
      } else {
        console.log('⚠️ API: No se encontró producto en toggleVisibility, devolviendo respuesta completa');
        return response.data;
      }
    } catch (error: unknown) {
      console.error('❌ API: Error en toggleVisibility:', error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async (): Promise<unknown[]> => {
    const response = await api.get('/products/categories/all');
    return response.data;
  },

  // Upload product image
  uploadImage: async (productId: string, imageFile: File): Promise<Product> => {
    console.log('🚀 API: uploadImage llamado con:', { productId, imageFile });
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post(`/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('✅ API: Imagen subida exitosamente:', response.data);
      
      // El backend devuelve {message: 'Image uploaded successfully', product: {...}}
      if (response.data && response.data.product) {
        return response.data.product;
      } else {
        return response.data;
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: any; status?: number } };
      console.error('❌ API: Error al subir imagen:', err);
      throw error;
    }
  }
};

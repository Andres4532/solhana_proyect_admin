import { useState, useEffect, useCallback } from 'react';
import { productsAPI, Product, CreateProductData, UpdateProductData } from '../services/productsAPI';
import { toast } from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Cambiar a true inicialmente
  const [error, setError] = useState<string | null>(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      // El backend devuelve {products: [...], totalPages: 1, currentPage: 1, total: 8}
      // Necesitamos extraer el array de productos
      const productsArray = (data as any)?.products || data || [];
      console.log('✅ Hook: Productos extraídos:', productsArray);
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al cargar productos';
      setError(message);
      toast.error(message);
      setProducts([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new product
  const createProduct = useCallback(async (productData: CreateProductData & { url?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productsAPI.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return { success: true, data: newProduct };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al crear producto';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update product
  const updateProduct = useCallback(async (id: string, productData: UpdateProductData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Hook: Actualizando producto con datos:', productData);
      
      const updatedProduct = await productsAPI.update(id, productData);
      console.log('🔄 Hook: Producto devuelto por API:', updatedProduct);
      
      // ✅ CORREGIDO: Forzar recarga de productos para asegurar datos actualizados
      console.log('🔄 Hook: Forzando recarga de productos...');
      await fetchProducts();
      console.log('✅ Hook: Productos recargados exitosamente');
      
      return { success: true, data: updatedProduct };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al actualizar producto';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Delete product
  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(prod => prod._id !== id));
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al eliminar producto';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle product status
  const toggleProductStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const product = products.find(prod => prod._id === id);
      if (!product) return { success: false, error: 'Producto no encontrado' };

      const newStatus = product.status === 1 ? 0 : 1;
      const updatedProduct = await productsAPI.toggleStatus(id, newStatus);
      
      setProducts(prev => prev.map(prod => prod._id === id ? updatedProduct : prod));
      
      const statusText = newStatus === 1 ? 'activado' : 'desactivado';
      
      return { success: true, data: updatedProduct };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al cambiar estado de producto';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Toggle product visibility
  const toggleProductVisibility = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Hook: Iniciando toggleProductVisibility para ID:', id);
      console.log('🔄 Hook: Productos actuales:', products);
      
      const product = products.find(prod => prod._id === id);
      if (!product) {
        console.error('❌ Hook: Producto no encontrado:', id);
        return { success: false, error: 'Producto no encontrado' };
      }

      console.log('🔄 Hook: Producto encontrado:', product);
      const newVisibility = !product.visibleItem;
      console.log('🔄 Hook: Nueva visibilidad:', newVisibility);

      const updatedProduct = await productsAPI.toggleVisibility(id, newVisibility);
      console.log('🔄 Hook: Producto actualizado por API:', updatedProduct);
      
      // Actualizar el estado local
      setProducts(prev => {
        const newProducts = prev.map(prod => prod._id === id ? updatedProduct : prod);
        console.log('🔄 Hook: Estado actualizado:', newProducts);
        return newProducts;
      });
      
      const visibilityText = newVisibility ? 'visible' : 'oculto';
      
      console.log('✅ Hook: Visibilidad cambiada exitosamente');
      return { success: true, data: updatedProduct };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al cambiar visibilidad de producto';
      setError(message);
      toast.error(message);
      console.error('❌ Hook: Error al cambiar visibilidad:', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Get product by ID
  const getProductById = useCallback((id: string) => {
    return products.find(prod => prod._id === id);
  }, [products]);

  // Get active products only
  const getActiveProducts = useCallback(() => {
    return products.filter(prod => prod.status === 1);
  }, [products]);

  // Get visible products only
  const getVisibleProducts = useCallback(() => {
    return products.filter(prod => prod.visibleItem);
  }, [products]);

  // Get products by category
  const getProductsByCategory = useCallback((categoryId: string) => {
    return products.filter(prod => {
      // Manejar tanto string como objeto populado
      if (typeof prod.categoryProductId === 'string') {
        return prod.categoryProductId === categoryId;
      } else if (prod.categoryProductId && typeof prod.categoryProductId === 'object') {
        return prod.categoryProductId._id === categoryId;
      }
      return false;
    });
  }, [products]);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductVisibility,
    getProductById,
    getActiveProducts,
    getVisibleProducts,
    getProductsByCategory,
  };
};

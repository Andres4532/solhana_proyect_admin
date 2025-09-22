import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { productVariablesAPI, ProductVariable, CreateVariableData, UpdateVariableData, PricingOption, CreatePricingOptionData } from '../services/productVariablesAPI';

export const useProductVariables = (productId: string) => {
  const [variables, setVariables] = useState<ProductVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener variables del producto
  const getVariables = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.getProductVariables(productId);
      
      if (response.success) {
        setVariables(response.data);
      } else {
        setError('Error al cargar las variables');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al cargar las variables';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Crear nueva variable
  const createVariable = useCallback(async (data: CreateVariableData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.createVariable(productId, data);
      
      if (response.success) {
        setVariables(prev => [...prev, response.data]);
        toast.success('Variable creada exitosamente');
        return { success: true, data: response.data };
      } else {
        setError('Error al crear la variable');
        return { success: false, error: 'Error al crear la variable' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al crear la variable';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Actualizar variable
  const updateVariable = useCallback(async (id: string, data: UpdateVariableData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.updateVariable(id, data);
      
      if (response.success) {
        setVariables(prev => prev.map(v => v._id === id ? response.data : v));
        toast.success('Variable actualizada exitosamente');
        return { success: true, data: response.data };
      } else {
        setError('Error al actualizar la variable');
        return { success: false, error: 'Error al actualizar la variable' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al actualizar la variable';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar variable
  const deleteVariable = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.deleteVariable(id);
      
      if (response.success) {
        setVariables(prev => prev.filter(v => v._id !== id));
        toast.success('Variable eliminada exitosamente');
        return { success: true };
      } else {
        setError('Error al eliminar la variable');
        return { success: false, error: 'Error al eliminar la variable' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al eliminar la variable';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear opción de precio
  const createPricingOption = useCallback(async (variableId: string, data: CreatePricingOptionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.createPricingOption(variableId, data);
      
      if (response.success) {
        // Actualizar la variable con la nueva opción
        setVariables(prev => prev.map(v => {
          if (v._id === variableId) {
            return {
              ...v,
              options: [...v.options, response.data]
            };
          }
          return v;
        }));
        toast.success('Opción de precio creada exitosamente');
        return { success: true, data: response.data };
      } else {
        setError('Error al crear la opción de precio');
        return { success: false, error: 'Error al crear la opción de precio' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al crear la opción de precio';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar opción de precio
  const updatePricingOption = useCallback(async (id: string, data: Partial<CreatePricingOptionData>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.updatePricingOption(id, data);
      
      if (response.success) {
        // Actualizar la opción en todas las variables
        setVariables(prev => prev.map(v => ({
          ...v,
          options: v.options.map(opt => opt._id === id ? response.data : opt)
        })));
        toast.success('Opción de precio actualizada exitosamente');
        return { success: true, data: response.data };
      } else {
        setError('Error al actualizar la opción de precio');
        return { success: false, error: 'Error al actualizar la opción de precio' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al actualizar la opción de precio';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar opción de precio
  const deletePricingOption = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productVariablesAPI.deletePricingOption(id);
      
      if (response.success) {
        // Eliminar la opción de todas las variables
        setVariables(prev => prev.map(v => ({
          ...v,
          options: v.options.filter(opt => opt._id !== id)
        })));
        toast.success('Opción de precio eliminada exitosamente');
        return { success: true };
      } else {
        setError('Error al eliminar la opción de precio');
        return { success: false, error: 'Error al eliminar la opción de precio' };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Error al eliminar la opción de precio';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    variables,
    loading,
    error,
    getVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    createPricingOption,
    updatePricingOption,
    deletePricingOption
  };
};

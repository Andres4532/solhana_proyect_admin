import { api } from './api';

export interface ProductVariable {
  _id: string;
  name: string;
  canMany: boolean;
  required: boolean;
  instructions: string;
  productsId: string;
  quantity: number;
  options: PricingOption[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingOption {
  _id: string;
  name: string;
  basePrice: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariableData {
  name: string;
  canMany?: boolean;
  required?: boolean;
  instructions?: string;
  quantity?: number;
}

export interface UpdateVariableData {
  name?: string;
  canMany?: boolean;
  required?: boolean;
  instructions?: string;
  quantity?: number;
  status?: number;
}

export interface CreatePricingOptionData {
  name: string;
  basePrice: number | string;
}

export const productVariablesAPI = {
  // Obtener variables de un producto
  getProductVariables: async (productId: string): Promise<{ success: boolean; data: ProductVariable[] }> => {
    const response = await api.get(`/product-variables/product/${productId}`);
    return response.data;
  },

  // Crear nueva variable
  createVariable: async (productId: string, data: CreateVariableData): Promise<{ success: boolean; data: ProductVariable }> => {
    const response = await api.post(`/product-variables/product/${productId}`, data);
    return response.data;
  },

  // Actualizar variable
  updateVariable: async (id: string, data: UpdateVariableData): Promise<{ success: boolean; data: ProductVariable }> => {
    const response = await api.put(`/product-variables/${id}`, data);
    return response.data;
  },

  // Eliminar variable
  deleteVariable: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/product-variables/${id}`);
    return response.data;
  },

  // Crear opción de precio
  createPricingOption: async (variableId: string, data: CreatePricingOptionData): Promise<{ success: boolean; data: PricingOption }> => {
    // Enviar solo los campos necesarios
    const requestData = {
      name: data.name,
      basePrice: data.basePrice === "" ? 0 : Number(data.basePrice),
      pv: variableId
    };
    
    console.log('📤 API - Enviando requestData:', requestData)
    console.log('📤 API - data.basePrice type:', typeof data.basePrice, 'value:', data.basePrice)
    
    const response = await api.post(`/pricing`, requestData);
    console.log('📥 API - Respuesta del servidor:', response.data)
    console.log('📥 API - data.basePrice en respuesta:', response.data.data?.basePrice, 'tipo:', typeof response.data.data?.basePrice)
    return response.data;
  },

  // Actualizar opción de precio
  updatePricingOption: async (id: string, data: Partial<CreatePricingOptionData>): Promise<{ success: boolean; data: PricingOption }> => {
    const requestData = {
      ...data
    };
    const response = await api.put(`/pricing/${id}`, requestData);
    return response.data;
  },

  // Eliminar opción de precio
  deletePricingOption: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/pricing/${id}`);
    return response.data;
  }
};

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"
import { Product } from "../src/services/productsAPI"
import { ProductVariable, PricingOption } from "../src/services/productVariablesAPI"
import { useProductVariables } from "../src/hooks/useProductVariables"
import { useProductSync } from "../src/contexts/ProductSyncContext"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: CartItem) => void
}

interface CartItem {
  product: Product
  quantity: number
  selectedOptions: SelectedOption[]
  totalPrice: number
}

interface SelectedOption {
  variableId: string
  variableName: string
  optionId: string
  optionName: string
  price: number
  quantity: number
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const { variables, loading: variablesLoading, getVariables } = useProductVariables(product?._id || "")
  const { refreshTrigger, currentVariables, setCurrentVariables, refreshVariables } = useProductSync()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [hasVariables, setHasVariables] = useState(false)

  // Cargar variables cuando se abre el modal
  useEffect(() => {
    if (product && isOpen) {
      setQuantity(1)
      setSelectedOptions([])
      
      // Intentar cargar variables
      getVariables()
    }
  }, [product, isOpen, getVariables])

  // Sincronizar variables cuando cambie el refreshTrigger
  useEffect(() => {
    if (product && isOpen && refreshTrigger > 0) {
      console.log('🔄 ProductModal: Refrescando variables por sincronización')
      getVariables()
    }
  }, [refreshTrigger, product, isOpen, getVariables])

  // Sincronizar variables del contexto
  useEffect(() => {
    if (currentVariables.length > 0 && product && isOpen) {
      console.log('🔄 ProductModal: Variables sincronizadas desde contexto:', currentVariables)
      // Las variables ya están actualizadas en el hook useProductVariables
    }
  }, [currentVariables, product, isOpen])

  // Actualizar hasVariables basándose en la respuesta del hook
  useEffect(() => {
    console.log('🔍 Modal Debug - Variables:', {
      productId: product?._id,
      productName: product?.name,
      variablesLoading,
      variablesCount: variables.length,
      variables: variables.map(v => ({
        id: v._id,
        name: v.name,
        optionsCount: v.options.length
      }))
    })
    
    if (!variablesLoading && variables.length > 0) {
      setHasVariables(true)
    } else if (!variablesLoading && variables.length === 0) {
      setHasVariables(false)
    }
  }, [variables, variablesLoading, product])

  // Calcular precio total
  useEffect(() => {
    if (!product) return

    const basePrice = typeof product.pricing === 'number' ? product.pricing : parseFloat(product.pricing)
    const optionsPrice = selectedOptions.reduce((total, option) => {
      return total + (option.price * option.quantity)
    }, 0)
    
    setTotalPrice((basePrice + optionsPrice) * quantity)
  }, [product, selectedOptions, quantity])

  const handleOptionChange = (variable: ProductVariable, option: PricingOption, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remover la opción si la cantidad es 0
      setSelectedOptions(prev => prev.filter(opt => opt.optionId !== option._id))
    } else {
      // Verificar límites según la configuración de la variable
      const currentOptionsForVariable = selectedOptions.filter(opt => opt.variableId === variable._id)
      
      // Si no permite múltiples (canMany: false), solo puede seleccionar una opción
      if (!variable.canMany && currentOptionsForVariable.length >= 1 && !currentOptionsForVariable.find(opt => opt.optionId === option._id)) {
        return // No permitir seleccionar otra opción si ya hay una seleccionada
      }
      
      // Si permite múltiples pero tiene límite de cantidad
      if (variable.canMany && variable.quantity > 0 && currentOptionsForVariable.length >= variable.quantity && !currentOptionsForVariable.find(opt => opt.optionId === option._id)) {
        return // No permitir seleccionar más opciones si ya se alcanzó el límite
      }

      // Actualizar o agregar la opción
      const existingIndex = selectedOptions.findIndex(opt => opt.optionId === option._id)
      const newOption: SelectedOption = {
        variableId: variable._id,
        variableName: variable.name,
        optionId: option._id,
        optionName: option.name,
        price: typeof option.basePrice === 'number' ? option.basePrice : parseFloat(option.basePrice),
        quantity: newQuantity
      }

      if (existingIndex >= 0) {
        setSelectedOptions(prev => prev.map((opt, index) => 
          index === existingIndex ? newOption : opt
        ))
      } else {
        setSelectedOptions(prev => [...prev, newOption])
      }
    }
  }

  const getOptionQuantity = (optionId: string) => {
    const option = selectedOptions.find(opt => opt.optionId === optionId)
    return option ? option.quantity : 0
  }

  const handleAddToCart = () => {
    if (!product) return

    // Solo validar variables obligatorias si el producto tiene variables
    if (hasVariables) {
      const requiredVariables = variables.filter(v => v.required)
      const missingRequired = requiredVariables.filter(variable => {
        const hasSelection = selectedOptions.some(opt => opt.variableId === variable._id)
        return !hasSelection
      })

      if (missingRequired.length > 0) {
        // Mostrar mensaje de error o toast
        console.warn('Debes seleccionar opciones para las variables obligatorias:', missingRequired.map(v => v.name))
        return
      }
    }

    const cartItem: CartItem = {
      product,
      quantity,
      selectedOptions,
      totalPrice
    }

    onAddToCart(cartItem)
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen del producto */}
          <div className="aspect-video bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg overflow-hidden">
            {product.url ? (
              <img 
                src={product.url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🍕</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Variables del producto */}
          {hasVariables ? (
            variablesLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : variables.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personaliza tu pedido</h3>
              {variables.map((variable) => (
                <div key={variable._id} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{variable.name}</h4>
                      <div className="flex items-center space-x-2">
                        {variable.required && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Obligatorio
                          </span>
                        )}
                        {variable.canMany && variable.quantity > 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Máx. {variable.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                    {variable.instructions && (
                      <p className="text-sm text-gray-600 mb-3">{variable.instructions}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {variable.options.map((option) => {
                      const isSelected = getOptionQuantity(option._id) > 0
                      const currentOptionsForVariable = selectedOptions.filter(opt => opt.variableId === variable._id)
                      const canSelect = variable.canMany || currentOptionsForVariable.length === 0 || isSelected
                      
                      return (
                        <div 
                          key={option._id} 
                          className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all duration-200 ${
                            isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 
                            !canSelect ? 'opacity-50 bg-gray-50 border-gray-200' : 
                            'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium text-gray-900">{option.name}</span>
                                {!variable.canMany && currentOptionsForVariable.length > 0 && !isSelected && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    Ya seleccionado
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const price = typeof option.basePrice === 'number' ? option.basePrice : parseFloat(option.basePrice)
                                return price > 0 ? (
                                  <span className="text-base font-semibold text-orange-600 mr-4">
                                    Bs. {price}
                                  </span>
                                ) : null
                              })()}
                            </div>
                          </div>
                        
                        {variable.canMany ? (
                          <div className="flex items-center space-x-2 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full border-2 hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => handleOptionChange(variable, option, getOptionQuantity(option._id) - 1)}
                              disabled={getOptionQuantity(option._id) <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {getOptionQuantity(option._id)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full border-2 hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => handleOptionChange(variable, option, getOptionQuantity(option._id) + 1)}
                              disabled={(() => {
                                const currentQuantity = getOptionQuantity(option._id)
                                const currentOptionsForVariable = selectedOptions.filter(opt => opt.variableId === variable._id)
                                
                                // Si permite múltiples pero tiene límite de cantidad
                                if (variable.quantity > 0) {
                                  // Si ya está seleccionada, puede incrementar su cantidad
                                  if (currentQuantity > 0) return false
                                  // Si no está seleccionada, verificar si ya se alcanzó el límite
                                  return currentOptionsForVariable.length >= variable.quantity
                                }
                                
                                return false
                              })()}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center ml-2">
                            <input
                              type="checkbox"
                              checked={getOptionQuantity(option._id) > 0}
                              onChange={() => {
                                if (getOptionQuantity(option._id) > 0) {
                                  // Si ya está seleccionado, deseleccionarlo
                                  handleOptionChange(variable, option, 0)
                                } else {
                                  // Si no está seleccionado, seleccionarlo
                                  handleOptionChange(variable, option, 1)
                                }
                              }}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay opciones de personalización disponibles para este producto.</p>
              </div>
            )
          ) : null}

          {/* Resumen del pedido */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">Cantidad</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Opciones seleccionadas */}
            {selectedOptions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Opciones seleccionadas:</h4>
                <div className="space-y-1">
                  {selectedOptions.map((option) => (
                    <div key={option.optionId} className="flex justify-between text-sm text-gray-600">
                      <span>{option.optionName} x{option.quantity}</span>
                      <span>Bs. {option.price * option.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Precio total */}
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>Bs. {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón de agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 text-lg"
          >
            Agregar Bs. {totalPrice.toFixed(0)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

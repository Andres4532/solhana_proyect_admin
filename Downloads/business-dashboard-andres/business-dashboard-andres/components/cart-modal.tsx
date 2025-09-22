"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus } from "lucide-react"

interface CartItem {
  product: {
    _id: string
    name: string
    pricing: number | string
    url?: string
  }
  quantity: number
  selectedOptions: {
    variableName: string
    optionName: string
    price: number
    quantity: number
  }[]
  totalPrice: number
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function CartModal({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CartModalProps) {
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
            <span>Mi Carrito</span>
            <span className="text-lg font-normal text-gray-600">
              {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
              <p className="text-gray-400">Agrega algunos productos para comenzar</p>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={`${item.product._id}-${index}`} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      {/* Imagen del producto */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.url ? (
                          <img 
                            src={item.product.url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🍕</span>
                          </div>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg">{item.product.name}</h3>
                        
                        {/* Opciones seleccionadas */}
                        {item.selectedOptions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.selectedOptions.map((option, optIndex) => (
                              <div key={optIndex} className="text-sm text-gray-600">
                                <span className="font-medium">{option.variableName}:</span> {option.optionName}
                                {option.quantity > 1 && ` x${option.quantity}`}
                                {option.price > 0 && (
                                  <span className="text-orange-600 font-medium ml-2">
                                    +Bs. {option.price * option.quantity}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Precio y controles */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => onUpdateQuantity(`${item.product._id}-${index}`, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => onUpdateQuantity(`${item.product._id}-${index}`, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-900">
                              Bs. {item.totalPrice.toFixed(2)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onRemoveItem(`${item.product._id}-${index}`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>Bs. {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Seguir Comprando
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Proceder al Pago
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


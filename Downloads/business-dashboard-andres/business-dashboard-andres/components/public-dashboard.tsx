"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ShoppingCart, Plus } from "lucide-react"
import { useCategoriesContext } from "../src/contexts/CategoriesContext"
import { useProducts } from "../src/hooks/useProducts"
import { useProductSync } from "../src/contexts/ProductSyncContext"
import { ProductModal } from "./product-modal"
import { CartModal } from "./cart-modal"
import { Product } from "../src/services/productsAPI"
import { useState } from "react"

export function PublicDashboard() {
  // Hooks para datos reales
  const { categories, loading: categoriesLoading } = useCategoriesContext()
  const { products, loading: productsLoading, getProductsByCategory } = useProducts()
  const { setCurrentProduct } = useProductSync()
  
  // Estado para el modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Calcular estadísticas reales
  const activeCategories = categories.filter(cat => cat.status === 1)
  
  // Obtener productos por categoría para mostrar cada categoría con sus productos
  const getProductsForCategory = (categoryId: string) => {
    const categoryProducts = getProductsByCategory(categoryId)
    const activeProducts = categoryProducts.filter(prod => prod.status === 1 && prod.visibleItem)
    
    // Debug logs
    console.log(`🔍 Categoría ${categoryId}:`, {
      totalProducts: categoryProducts.length,
      activeProducts: activeProducts.length,
      products: categoryProducts.map(p => ({
        name: p.name,
        status: p.status,
        visibleItem: p.visibleItem,
        categoryProductId: p.categoryProductId
      }))
    })
    
    return activeProducts
  }
  
  // Filtrar categorías que tienen productos activos y visibles
  const categoriesWithProducts = activeCategories.filter(category => {
    const categoryProducts = getProductsForCategory(category._id)
    return categoryProducts.length > 0
  })
  
  // Funciones para manejar el modal y carrito
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setCurrentProduct(product) // Sincronizar con el contexto
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setCurrentProduct(null) // Limpiar el contexto
  }

  const handleAddToCart = (cartItem: any) => {
    setCartItems(prev => [...prev, cartItem])
    console.log('Producto agregado al carrito:', cartItem)
    // Aquí puedes agregar lógica adicional como toast notifications
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map((item, index) => 
      `${item.product._id}-${index}` === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: (item.totalPrice / item.quantity) * newQuantity }
        : item
    ))
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter((item, index) => 
      `${item.product._id}-${index}` !== itemId
    ))
  }

  // Debug logs
  console.log('🔍 Debug Dashboard:', {
    categories: categories.length,
    activeCategories: activeCategories.length,
    categoriesWithProducts: categoriesWithProducts.length,
    products: products.length,
    activeProducts: products.filter(prod => prod.status === 1 && prod.visibleItem).length,
    categoriesData: categoriesWithProducts.map(cat => ({
      id: cat._id,
      name: cat.categoryName,
      status: cat.status
    }))
  })

  // Mostrar loading si los datos se están cargando
  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        {/* Header con búsqueda y carrito */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-orange-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navegación de categorías */}
        <div className="bg-yellow-400 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-6 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-24 bg-yellow-300 rounded animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header con búsqueda y carrito */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Search className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">🍕</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Pizza Kitchen</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-orange-50 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navegación de categorías - Solo visual */}
      <div className="bg-yellow-400 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {categoriesWithProducts.map((category) => (
              <div
                key={category._id}
                className="px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap text-black hover:bg-yellow-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                onClick={() => {
                  // Scroll suave a la sección de la categoría
                  const element = document.getElementById(`category-${category._id}`)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
              >
                {category.categoryName.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Mostrar cada categoría con sus productos */}
          {categoriesWithProducts.map((category) => {
            const categoryProducts = getProductsForCategory(category._id)
            
            return (
              <div key={category._id} id={`category-${category._id}`} className="space-y-6">
                {/* Título de la categoría */}
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {category.categoryName.toUpperCase()}
                  </h2>
                  <p className="text-gray-600">
                    {category.description || `Deliciosos ${category.categoryName.toLowerCase()} para disfrutar`}
                  </p>
                </div>
                
                {/* Grid de productos de esta categoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <div key={product._id} className="group hover:shadow-xl transition-all duration-300 bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="relative">
                        {/* Imagen del producto */}
                        <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 overflow-hidden">
                          {product.url ? (
                            <img 
                              src={product.url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl">🍕</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Precio - estilo similar a la imagen */}
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                          {typeof product.pricing === 'number' ? product.pricing : parseFloat(product.pricing)} Bs.
                        </div>
                      </div>
                      
                      {/* Contenido de la tarjeta */}
                      <div className="p-4 bg-white">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Información adicional del producto */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• Producto fresco y delicioso</p>
                            <p>• Preparado al momento</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botón de agregar al carrito - estilo similar a la imagen */}
                      <div className="p-4 bg-gray-50 border-t">
                        <Button 
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                          onClick={() => handleProductClick(product)}
                        >
                          <Plus className="h-5 w-5" />
                          <span>Agregar al Carrito</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          
          {/* Mensaje si no hay categorías con productos */}
          {categoriesWithProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay productos disponibles
              </h3>
              <p className="text-gray-600">
                Estamos preparando deliciosos productos para ti
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />

      {/* Modal del carrito */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  )
}

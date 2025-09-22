"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  FolderOpen, 
  Grid3X3, 
  List,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Archive,
  Loader2,
  ChevronDown,
  Circle,
  CheckSquare
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "react-hot-toast"
import Swal from 'sweetalert2'
import { useCategories } from "../src/hooks/useCategories"
import { useProducts } from "../src/hooks/useProducts"
import { useProductVariables } from "../src/hooks/useProductVariables"
import { useProductSync } from "../src/contexts/ProductSyncContext"
import { Category, CreateCategoryData, UpdateCategoryData } from "../src/services/categoriesAPI"
import { Product, CreateProductData, UpdateProductData } from "../src/services/productsAPI"
import { ProductVariable, CreateVariableData, UpdateVariableData, PricingOption, CreatePricingOptionData } from "../src/services/productVariablesAPI"

export function ProductsSection() {
  // Configuración personalizada de SweetAlert2
  Swal.getContainer()?.classList.add('swal2-custom')
  const [activeTab, setActiveTab] = useState("categories")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [productsViewMode, setProductsViewMode] = useState<"grid" | "list">("grid")
  const [variablesViewMode, setVariablesViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "visible" | "hidden">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  
  // Use real hooks
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getActiveCategories
  } = useCategories()

  const {
    products,
    loading: productsLoading,
    error: productsError,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductVisibility,
    getProductsByCategory
  } = useProducts()
  
  // Categories state
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<CreateCategoryData>({
    categoryName: "",
    description: "",
  })

  // Products state
  const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [showVariablesSection, setShowVariablesSection] = useState(false)
  const [newProduct, setNewProduct] = useState<CreateProductData & { imageUrl?: string }>({
    name: "",
    description: "",
    pricing: "",
    categoryProductId: "",
    imageUrl: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Estado local para forzar re-renderizado
  const [forceUpdate, setForceUpdate] = useState(0)
  const [categoriesForceUpdate, setCategoriesForceUpdate] = useState(0)
  
  // Variables hook
  const {
    variables: productVariables,
    loading: variablesLoading,
    error: variablesError,
    getVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    createPricingOption,
    updatePricingOption,
    deletePricingOption
  } = useProductVariables(viewingProduct?._id || "")

  // Sincronización hook
  const { triggerRefresh, setCurrentProduct, setCurrentVariables } = useProductSync()
  
  // Variables state
  // Product variables state - RECREADO DESDE CERO
  const [isCreateVariableDialogOpen, setIsCreateVariableDialogOpen] = useState(false)
  const [isCreatePricingOptionDialogOpen, setIsCreatePricingOptionDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<ProductVariable | null>(null)
  const [editingPricingOption, setEditingPricingOption] = useState<PricingOption | null>(null)
  const [optionQuantities, setOptionQuantities] = useState<{[key: string]: number}>({})

  // Función para calcular precio con cantidad
  const calculatePriceWithQuantity = (option: PricingOption, quantity: number = 1) => {
    const basePrice = parseFloat(option.basePrice.toString())
        return basePrice * quantity
  }
  const [selectedVariableForPricing, setSelectedVariableForPricing] = useState<ProductVariable | null>(null)
  const [isCreatingVariable, setIsCreatingVariable] = useState(false)
  const [newVariable, setNewVariable] = useState<CreateVariableData>({
    name: "",
    required: false,
    canMany: false,
    instructions: "",
    quantity: 1
  })
  const [newPricingOption, setNewPricingOption] = useState<CreatePricingOptionData>({
    name: "",
    basePrice: ""
  })
  
  // useEffect para recargar variables cuando cambie el producto
  useEffect(() => {
    if (viewingProduct?._id && showVariablesSection) {
      getVariables()
    }
  }, [viewingProduct?._id, showVariablesSection, getVariables])
  


  // Category handlers
  const handleCreateCategory = async () => {
    if (newCategory.categoryName) {
      const result = await createCategory(newCategory)
      if (result.success) {
        setNewCategory({ categoryName: "", description: "" })
        setIsCreateCategoryDialogOpen(false)
        
        // Forzar actualización del estado local
        setTimeout(() => {
          setCategoriesForceUpdate(prev => prev + 1)
        }, 100)
      }
    }
  }

  const handleUpdateCategory = async (category: Category) => {
    try {
      const updateData: UpdateCategoryData = {
        categoryName: category.categoryName,
        description: category.description,
      }
      
      const result = await updateCategory(category._id, updateData)
      
      if (result.success) {
        setEditingCategory(null)
        
        // Forzar actualización del estado local
        setTimeout(() => {
          setCategoriesForceUpdate(prev => prev + 1)
        }, 100)
      } else {
        console.error('❌ Componente: Error al actualizar categoría:', result.error)
        toast.error(`Error al actualizar categoría: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Componente: Error en handleUpdateCategory:', error)
      toast.error('Error al actualizar la categoría')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteCategory(categoryId)
        if (deleteResult?.success) {
          Swal.fire(
            '¡Eliminada!',
            'La categoría ha sido eliminada exitosamente.',
            'success'
          )
        }
      } catch (error) {
        Swal.fire(
          'Error',
          'No se pudo eliminar la categoría.',
          'error'
        )
      }
    }
  }

  const handleToggleCategoryStatus = async (categoryId: string) => {
    await toggleCategoryStatus(categoryId)
  }

  // Product handlers
  // Image handlers
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Función para crear producto con FormData (para subir archivos a MinIO)
  const createProductWithFormData = async (formData: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend error details:', errorData)
        throw new Error(`HTTP error! status: ${response.status}. ${errorData.message || 'Bad Request'}`)
      }

      const data = await response.json()
      return { success: true, data: data.product }
    } catch (error: unknown) {
      console.error('Error creating product with FormData:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }


  const handleCreateProduct = async () => {
    if (newProduct.name && newProduct.pricing && newProduct.categoryProductId) {
      try {
        let imageUrl = newProduct.imageUrl;
        
        // Si se subió un archivo, convertirlo a base64
        if (selectedImage) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64String = e.target?.result as string;
            imageUrl = base64String;
            
            // Crear producto con imagen base64
            const productData = {
              ...newProduct,
              url: imageUrl
            }
            
            const result = await createProduct(productData)
            if (result.success) {
              toast.success('Producto creado exitosamente')
              setNewProduct({ name: "", description: "", pricing: "", categoryProductId: "", imageUrl: "" })
              setSelectedImage(null)
              setImagePreview(null)
              setIsCreateProductDialogOpen(false)
            } else {
              toast.error(`Error al crear el producto: ${result.error}`)
            }
          };
          reader.readAsDataURL(selectedImage);
        } else {
      // Crear producto con URL de imagen
      const productData = {
        ...newProduct,
            url: imageUrl || undefined
      }
      
      const result = await createProduct(productData)
      if (result.success) {
        toast.success('Producto creado exitosamente')
        setNewProduct({ name: "", description: "", pricing: "", categoryProductId: "", imageUrl: "" })
        setSelectedImage(null)
        setImagePreview(null)
        setIsCreateProductDialogOpen(false)
          } else {
            toast.error(`Error al crear el producto: ${result.error}`)
          }
        }
      } catch (error) {
        toast.error('Error al crear el producto')
        console.error('Error creating product:', error)
      }
    } else {
      toast.error("Por favor completa todos los campos obligatorios")
    }
  }

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setShowVariablesSection(true)
  }

  const handleBackToProducts = () => {
    setShowVariablesSection(false)
    setViewingProduct(null)
  }

  const handleUpdateProduct = async (product: Product) => {
    try {
      let imageUrl = product.url;
      
      // Si se subió un archivo, convertirlo a base64
      if (selectedImage) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          imageUrl = base64String;
          
          const updateData: UpdateProductData & { url?: string } = {
            name: product.name,
            description: product.description,
            pricing: product.pricing === "" ? 0 : Number(product.pricing),
            categoryProductId: typeof product.categoryProductId === 'string' ? product.categoryProductId : product.categoryProductId._id,
            status: product.status,
            visibleItem: product.visibleItem,
            url: imageUrl
          }
          
          const result = await updateProduct(product._id, updateData)
          
          if (result.success) {
            setEditingProduct(null)
            setSelectedImage(null)
            setImagePreview(null)
            toast.success('Producto actualizado exitosamente')
          } else {
            toast.error('Error al actualizar el producto')
          }
        };
        reader.readAsDataURL(selectedImage);
      } else {
        const updateData: UpdateProductData & { url?: string } = {
          name: product.name,
          description: product.description,
          pricing: product.pricing === "" ? 0 : Number(product.pricing),
          categoryProductId: typeof product.categoryProductId === 'string' ? product.categoryProductId : product.categoryProductId._id,
          status: product.status,
          visibleItem: product.visibleItem,
          url: imageUrl || undefined
        }
        
        const result = await updateProduct(product._id, updateData)
        
        if (result.success) {
          setEditingProduct(null)
          setSelectedImage(null)
          setImagePreview(null)
          toast.success('Producto actualizado exitosamente')
        } else {
          toast.error('Error al actualizar el producto')
        }
      }
    } catch (error) {
      toast.error('Error al actualizar el producto')
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteProduct(productId)
        if (deleteResult?.success) {
          Swal.fire(
            '¡Eliminado!',
            'El producto ha sido eliminado exitosamente.',
            'success'
          )
        }
      } catch (error) {
        Swal.fire(
          'Error',
          'No se pudo eliminar el producto.',
          'error'
        )
      }
    }
  }

  const handleToggleProductStatus = async (productId: string) => {
    await toggleProductStatus(productId)
  }

  const handleToggleProductVisibility = async (productId: string) => {
    try {
      const result = await toggleProductVisibility(productId)
      
      if (result.success) {
        // Forzar actualización del estado local
        // Esto asegura que el componente se re-renderice con los datos actualizados
        setTimeout(() => {
          // Pequeño delay para asegurar que el estado se actualice
          // Forzar re-renderizado del componente
        setForceUpdate(prev => prev + 1)
        }, 100)
      } else {
        console.error('❌ Error al cambiar visibilidad:', result.error)
      }
    } catch (error) {
      console.error('❌ Error en handleToggleProductVisibility:', error)
      toast.error('Error al cambiar la visibilidad del producto')
    }
  }

  // Helper functions (mover antes de donde se usan)
  const getCategoryId = (categoryProductId: string | { _id: string; categoryName: string }): string => {
    if (!categoryProductId) return ""
    
    if (typeof categoryProductId === 'string') {
      return categoryProductId
    }
    
    // Add null check for object properties
    if (typeof categoryProductId === 'object' && categoryProductId !== null) {
      return categoryProductId._id || ""
    }
    
    return ""
  }

  const handleDuplicateProduct = async (product: Product) => {
    // Crear copia del producto
    const duplicatedProduct: CreateProductData & { url?: string } = {
      name: `${product.name} (Copia)`,
      description: product.description || "",
      pricing: product.pricing,
      categoryProductId: getCategoryId(product.categoryProductId),
      url: product.url || undefined
    }
    
    try {
      const result = await createProduct(duplicatedProduct)
      if (result.success) {
        toast.success('Producto duplicado exitosamente')
        // El hook ya actualiza automáticamente la lista de productos
        // No necesitamos recargar la página
      } else {
        toast.error(`Error al duplicar: ${result.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error al duplicar producto:', error)
      toast.error('Error al duplicar el producto')
    }
  }
  
  // Variables handlers - RECREADOS DESDE CERO
  const handleCreateVariable = async () => {
    if (!newVariable.name.trim()) {
      toast.error('El nombre de la variable es requerido')
      return
    }
    
    if (!viewingProduct?._id) {
      toast.error('No hay un producto seleccionado')
      return
    }
    
    
    try {
      setIsCreatingVariable(true)
      
      
      const result = await createVariable(newVariable)
      
      if (result.success) {
        // Limpiar el formulario
        setNewVariable({
          name: "",
          required: false,
          canMany: false,
          instructions: "",
          quantity: 1
        })
        
        // Cerrar el modal
        setIsCreateVariableDialogOpen(false)
        
        // Recargar variables para obtener datos completos
        if (viewingProduct?._id) {
          getVariables()
        }
        
        // Activar sincronización para el modal
        triggerRefresh()
        setCurrentVariables(productVariables)
      }
    } catch (error) {
      toast.error('Error al crear la variable. Inténtalo de nuevo.')
    } finally {
      setIsCreatingVariable(false)
    }
  }
  
  const handleUpdateVariable = async (variable: ProductVariable) => {
    if (!variable.name.trim()) {
      toast.error('El nombre de la variable es requerido')
      return
    }
    
    console.log('🔄 Actualizando variable:', variable)
    
    try {
      const updateData: UpdateVariableData = {
        name: variable.name,
        canMany: variable.canMany,
        required: variable.required,
        instructions: variable.instructions,
        quantity: variable.quantity
      }
      
      console.log('📤 Datos a enviar:', updateData)
      
      const result = await updateVariable(variable._id, updateData)
      
      console.log('📥 Resultado de la actualización:', result)
      
      if (result.success) {
        setEditingVariable(null)
        toast.success('Variable actualizada exitosamente')
        
        // Recargar variables para obtener datos completos
        if (viewingProduct?._id) {
          console.log('🔄 Recargando variables...')
          getVariables()
        }
        
        // Activar sincronización para el modal
        triggerRefresh()
        setCurrentVariables(productVariables)
      }
    } catch (error) {
      console.error('❌ Error al actualizar variable:', error)
      toast.error('Error al actualizar la variable. Inténtalo de nuevo.')
    }
  }
  
  const handleDeleteVariable = async (variableId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará la variable y todas sus opciones de precio",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteVariable(variableId)
        
        if (deleteResult.success) {
          // Recargar variables para obtener datos completos
          if (viewingProduct?._id) {
            getVariables()
          }
          
          // Activar sincronización para el modal
          triggerRefresh()
          setCurrentVariables(productVariables)
        }
      } catch (error) {
        console.error('Error al eliminar variable:', error)
        toast.error('Error al eliminar la variable. Inténtalo de nuevo.')
      }
    }
  }
  
  const handleCreatePricingOption = async () => {
    if (!newPricingOption.name || !newPricingOption.basePrice || !selectedVariableForPricing?._id) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    
      try {
        const result = await createPricingOption(selectedVariableForPricing._id, newPricingOption)
        
        if (result.success) {
          setNewPricingOption({
            name: "",
                       basePrice: ""
          })
          setIsCreatePricingOptionDialogOpen(false)
          setSelectedVariableForPricing(null)
        }
      } catch (error) {
        console.error('❌ Error creating pricing option:', error)
        toast.error('Error al crear la opción de precio')
    }
  }
  
  const handleUpdatePricingOption = async (option: PricingOption) => {
    if (!option._id) {
      toast.error('Error: ID de opción no válido')
      return
    }
    
    try {
      const updateData: Partial<CreatePricingOptionData> = {
        name: option.name,
        basePrice: option.basePrice
      }
      const result = await updatePricingOption(option._id, updateData)
      if (result.success) {
        setEditingPricingOption(null)
      }
    } catch (error) {
      toast.error('Error al actualizar la opción de precio')
    }
  }

  
  const handleDeletePricingOption = async (optionId: string) => {
    if (!optionId) {
      toast.error('Error: ID de opción no válido')
      return
    }
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await deletePricingOption(optionId)
        // El hook ya maneja el mensaje de éxito
      } catch (error) {
        toast.error('Error al eliminar la opción de precio')
      }
    }
  }

  // Filtered data
  const filteredCategories = categories.filter(category => {
    // Ensure category exists and has required properties
    if (!category || !category._id) return false
    
    // Add null checks for categoryName
    const categoryName = category?.categoryName || ""
    
    // Add null check for searchTerm
    const safeSearchTerm = searchTerm || ""
    
    const matchesSearch = categoryName.toLowerCase().includes(safeSearchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "visible" && category.status === 1) ||
                         (filterStatus === "hidden" && category.status === 0)
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    // Primero ordenar por estado: activas (1) primero, inactivas (0) después
    if (a.status !== b.status) {
      return b.status - a.status // 1 viene antes que 0
    }
    // Si tienen el mismo estado, ordenar alfabéticamente por nombre
    const nameA = a.categoryName?.toLowerCase() || ""
    const nameB = b.categoryName?.toLowerCase() || ""
    return nameA.localeCompare(nameB)
  })

  const filteredProducts = products.filter(product => {
    // Ensure product exists and has required properties
    if (!product || !product._id) return false
    
    // Add null check for product name
    const productName = product?.name || ""
    
    // Add null check for searchTerm
    const safeSearchTerm = searchTerm || ""
    
    const matchesSearch = productName.toLowerCase().includes(safeSearchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "visible" && product.visibleItem === true) ||
                         (filterStatus === "hidden" && product.visibleItem === false)
    const matchesCategory = filterCategory === "all" || getCategoryId(product.categoryProductId) === filterCategory
    

    
    return matchesSearch && matchesStatus && matchesCategory
  }).sort((a, b) => {
    // Primero ordenar por visibilidad: visibles (true) primero, ocultos (false) después
    if (a.visibleItem !== b.visibleItem) {
      return b.visibleItem ? 1 : -1 // true viene antes que false
    }
    // Si tienen la misma visibilidad, ordenar alfabéticamente por nombre
    const nameA = a.name?.toLowerCase() || ""
    const nameB = b.name?.toLowerCase() || ""
    return nameA.localeCompare(nameB)
  })

  // Effect para monitorear cambios en productos
  useEffect(() => {
    // Monitorear cambios en productos
  }, [products, filteredProducts, forceUpdate])

  // Effect para monitorear cambios en categorías
  useEffect(() => {
    // Monitorear cambios en categorías
  }, [categories, filteredCategories, categoriesForceUpdate])
  


  // Helper functions
  const getCategoryName = (categoryId: string | { _id: string; categoryName: string }): string => {
    try {
      // Si categoryId es un objeto (populado por el backend)
      if (typeof categoryId === 'object' && categoryId !== null) {
        if (categoryId.categoryName) {
          return categoryId.categoryName
        }
        return "Sin categoría"
      }
      
      // Si categoryId es un string (ID)
      if (typeof categoryId === 'string') {
        if (!categoryId) {
          return "Sin categoría"
        }
        
        // Buscar la categoría por ID
        const category = categories.find(cat => {
          // Add null check for category object
          if (!cat || !cat._id) return false
          return cat._id === categoryId
        })
        
        // Si no hay categoría o no tiene nombre, mostrar "Sin categoría"
        if (!category || !category.categoryName) {
          return "Sin categoría"
        }
        
        return category.categoryName
      }
      
      return "Sin categoría"
    } catch (error) {
      return "Sin categoría"
    }
  }

  const getProductCount = (categoryId: string) => {
    // Add null check for categoryId parameter
    if (!categoryId) return 0
    
    return products.filter(prod => {
      // Add null checks for product and categoryProductId
      if (!prod || !prod.categoryProductId) return false
      
      const prodCategoryId = typeof prod.categoryProductId === 'string' 
        ? prod.categoryProductId 
        : prod.categoryProductId?._id || ""
      return prodCategoryId === categoryId
    }).length
  }





  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (categoriesError || productsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los datos</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  // Si estamos viendo variables, mostrar la sección de variables
  if (showVariablesSection && viewingProduct) {
    return (
      <div className="space-y-6">
        

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Variables del Producto</h2>
            <p className="text-muted-foreground">
              Gestiona las variables personalizables de {viewingProduct.name}
            </p>
          </div>
                     <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
               <Button
                 variant={variablesViewMode === "grid" ? "default" : "outline"}
                 size="sm"
                 onClick={() => setVariablesViewMode("grid")}
               >
                 <Grid3X3 className="h-4 w-4" />
               </Button>
               <Button
                 variant={variablesViewMode === "list" ? "default" : "outline"}
                 size="sm"
                 onClick={() => setVariablesViewMode("list")}
               >
                 <List className="h-4 w-4" />
               </Button>
             </div>
             
             {/* ✅ BOTÓN CREAR VARIABLE */}
             <Button
               className="bg-blue-600 hover:bg-blue-700"
               onClick={() => {
                 // Limpiar el formulario antes de abrir
                 setNewVariable({
                   name: "",
                   required: false,
                   canMany: false,
                   instructions: "",
                   quantity: 1
                 })
                 setIsCreateVariableDialogOpen(true)
               }}
             >
               <Plus className="h-4 w-4 mr-2" />
               Crear Variable
             </Button>
             
             <Button
              variant="outline"
              onClick={() => {
                setShowVariablesSection(false)
                setViewingProduct(null)
              }}
            >
              ← Volver a Productos
             </Button>
           </div>
        </div>

                 {/* Variables del producto */}
         <div className="space-y-6">
           {variablesLoading ? (
             <div className="text-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
               <p className="text-gray-600">Cargando variables...</p>
             </div>
           ) : variablesError ? (
             <div className="text-center py-12">
               <p className="text-red-600 mb-4">Error al cargar las variables</p>
               <Button onClick={getVariables}>Reintentar</Button>
             </div>
           ) : productVariables.length === 0 ? (
             <div className="text-center py-12">
               <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay variables</h3>
               <p className="text-gray-500 mb-4">Este producto no tiene variables configuradas</p>
               <Button
                 className="bg-blue-600 hover:bg-blue-700"
                 onClick={() => {
                  // Limpiar el formulario antes de abrir
                  setNewVariable({
                    name: "",
                    required: false,
                    canMany: false,
                    instructions: "",
                    quantity: 1
                  })
                  setIsCreateVariableDialogOpen(true)
                }}
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Crear Primera Variable
               </Button>
             </div>
           ) : (
             <div className={variablesViewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
               {productVariables.map((variable) => (
                 <Card key={variable._id} className={`${variablesViewMode === "grid" ? "p-4" : "p-6"}`}>
                   <div className={`${variablesViewMode === "grid" ? "space-y-3" : "flex items-center justify-between mb-4"}`}>
                     <div>
                       <h3 className={`${variablesViewMode === "grid" ? "text-base font-semibold" : "text-lg font-semibold"}`}>{variable.name}</h3>
                       <p className="text-sm text-muted-foreground">{variable.instructions}</p>
                       <div className={`flex items-center gap-2 ${variablesViewMode === "grid" ? "mt-2" : "mt-2"}`}>
                         {variable.required && <Badge variant="secondary">Obligatorio</Badge>}
                         {variable.canMany && <Badge variant="outline">Múltiples</Badge>}
                         <Badge variant="outline">Cantidad: {variable.quantity}</Badge>
                       </div>
                       
                     </div>
                     <div className={`flex items-center gap-2 ${variablesViewMode === "grid" ? "mt-3" : ""}`}>
                       <Button
                         variant="outline"
                         size="sm"
                         className={variablesViewMode === "grid" ? "flex-1" : ""}
                         onClick={() => {
                           setSelectedVariableForPricing(variable)
                           setIsCreatePricingOptionDialogOpen(true)
                         }}
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         {variablesViewMode === "grid" ? "Agregar Opción" : "Agregar Opción"}
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setEditingVariable(variable)
                         }}
                       >
                         <Edit className="h-4 w-4 mr-2" />
                         {variablesViewMode === "grid" ? "Editar" : ""}
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDeleteVariable(variable._id)}
                       >
                         <Trash2 className="h-4 w-4" />
                         {variablesViewMode === "grid" ? "Eliminar" : ""}
                       </Button>
                     </div>
                   </div>
                   
                   {/* Opciones de precio */}
                   {variable.options && variable.options.length > 0 ? (
                     <div className="space-y-2">
                       <h4 className="font-medium">Opciones de precio:</h4>
                       <div className="grid gap-2 max-h-72 overflow-y-auto pr-2">
                         {variable.options.map((option, index) => (
                           <div key={`${option._id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                             <div>
                               <h4 className="font-medium">{option.name}</h4>
                                 <p className="text-sm font-semibold text-green-600">
                                   Bs. {calculatePriceWithQuantity(option, optionQuantities[option._id] || 1).toFixed(2)}
                                 </p>
                             </div>
                             <div className="flex items-center gap-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setEditingPricingOption(option);
                                   setSelectedVariableForPricing(variable);
                                 }}
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleDeletePricingOption(option._id)}
                                 className="text-red-600 hover:text-red-700"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="text-center py-4 text-muted-foreground">
                       <p>No hay opciones de precio configuradas</p>
                       <Button
                         variant="outline"
                         size="sm"
                         className="mt-2"
                         onClick={() => {
                           setSelectedVariableForPricing(variable)
                           setIsCreatePricingOptionDialogOpen(true)
                         }}
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Agregar Primera Opción
                       </Button>
                     </div>
                   )}
                 </Card>
               ))}
             </div>
           )}
         </div>

         {/* Modal de Agregar Opción de Precio - DENTRO DE LA SECCIÓN DE VARIABLES */}
         {isCreatePricingOptionDialogOpen && typeof window !== 'undefined' && createPortal(
           <div 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0,0,0,0.8)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 999999,
               padding: '20px'
             }}
           >
             <div 
               style={{
                 backgroundColor: 'white',
                 padding: '30px',
                 borderRadius: '10px',
                 boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                 maxWidth: '500px',
                 width: '100%',
                 maxHeight: '90vh',
                 overflow: 'auto',
                 border: '2px solid #3b82f6'
               }}
             >
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-blue-600">Agregar Opción de Precio</h2>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     setIsCreatePricingOptionDialogOpen(false)
                     setSelectedVariableForPricing(null)
                     setNewPricingOption({
                       name: "",
                       basePrice: ""
                     })
                   }}
                   className="h-8 w-8 p-0"
                 >
                   ✕
                 </Button>
               </div>
               
               <p className="text-gray-600 mb-4">
                 Agrega una nueva opción de precio para la variable: <strong>{selectedVariableForPricing?.name}</strong>
               </p>
               
               
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="optionName">Nombre del Price Bean</Label>
                   <Input
                     id="optionName"
                     value={newPricingOption.name}
                     onChange={(e) => setNewPricingOption({ ...newPricingOption, name: e.target.value })}
                     placeholder="Ej: Precio Base"
                   />
                 </div>
                 <div>
                   <Label htmlFor="optionBasePrice">Precio del Price Bean</Label>
                     <Input
                       id="optionBasePrice"
                     type="number"
                     step="0.01"
                       value={newPricingOption.basePrice}
                       onChange={(e) => setNewPricingOption({ ...newPricingOption, basePrice: e.target.value })}
                     placeholder="10.00"
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setIsCreatePricingOptionDialogOpen(false)
                     setSelectedVariableForPricing(null)
                     setNewPricingOption({
                       name: "",
                       basePrice: ""
                     })
                   }}
                 >
                   Cancelar
                 </Button>
                 <Button 
                   onClick={handleCreatePricingOption}
                 >
                   Agregar Opción
                 </Button>
               </div>
             </div>
           </div>,
           document.body
         )}

         {/* Modal de Editar Variable - DENTRO DE LA SECCIÓN DE VARIABLES */}
         {editingVariable && typeof window !== 'undefined' && createPortal(
           <div 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0,0,0,0.8)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 999999,
               padding: '20px'
             }}
           >
             <div 
               style={{
                 backgroundColor: 'white',
                 padding: '30px',
                 borderRadius: '10px',
                 boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                 maxWidth: '500px',
                 width: '100%',
                 maxHeight: '90vh',
                 overflow: 'auto',
                 border: '2px solid #3b82f6'
               }}
             >
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-blue-600">Editar Variable</h2>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setEditingVariable(null)}
                   className="h-8 w-8 p-0"
                 >
                   ✕
                 </Button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="editVariableName">Nombre de la Variable</Label>
                   <Input
                     id="editVariableName"
                     value={editingVariable.name}
                     onChange={(e) => setEditingVariable({ ...editingVariable, name: e.target.value })}
                   />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                   <div>
                     <Label htmlFor="editVariableQuantity">Cantidad</Label>
                     <Input
                       id="editVariableQuantity"
                       type="number"
                       min="1"
                       value={editingVariable.quantity}
                       onChange={(e) => setEditingVariable({ ...editingVariable, quantity: Number(e.target.value) })}
                       className={editingVariable.quantity < editingVariable.options.length ? "border-red-500" : ""}
                       placeholder="Máximo de opciones que puedes crear"
                     />
                     {editingVariable.quantity < editingVariable.options.length && (
                       <p className="text-red-500 text-sm mt-1">
                         ⚠️ No puedes reducir a {editingVariable.quantity} porque ya tienes {editingVariable.options.length} opciones. Elimina opciones primero.
                       </p>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       id="editVariableRequired"
                       checked={editingVariable.required}
                       onChange={(e) => setEditingVariable({ ...editingVariable, required: e.target.checked })}
                     />
                     <Label htmlFor="editVariableRequired">Obligatorio</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       id="editVariableCanMany"
                       checked={editingVariable.canMany}
                       onChange={(e) => setEditingVariable({ ...editingVariable, canMany: e.target.checked })}
                     />
                     <Label htmlFor="editVariableCanMany">Permite múltiples</Label>
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="editVariableInstructions">Instrucciones</Label>
                   <Textarea
                     id="editVariableInstructions"
                     value={editingVariable.instructions}
                     onChange={(e) => setEditingVariable({ ...editingVariable, instructions: e.target.value })}
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setEditingVariable(null)}
                 >
                   Cancelar
                 </Button>
                 <Button 
                   onClick={() => handleUpdateVariable(editingVariable)}
                 >
                   Actualizar Variable
                 </Button>
               </div>
             </div>
           </div>,
           document.body
         )}

         {/* Modal de Editar Opción de Precio - DENTRO DE LA SECCIÓN DE VARIABLES */}
         {editingPricingOption && typeof window !== 'undefined' && createPortal(
           <div 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0,0,0,0.8)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 999999,
               padding: '20px'
             }}
           >
             <div 
               style={{
                 backgroundColor: 'white',
                 padding: '30px',
                 borderRadius: '10px',
                 boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                 maxWidth: '500px',
                 width: '100%',
                 maxHeight: '90vh',
                 overflow: 'auto',
                 border: '2px solid #3b82f6'
               }}
             >
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-blue-600">Editar Opción de Precio</h2>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setEditingPricingOption(null)}
                   className="h-8 w-8 p-0"
                 >
                   ✕
                 </Button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="editOptionName">Nombre del Price Bean</Label>
                   <Input
                     id="editOptionName"
                     value={editingPricingOption.name}
                     onChange={(e) => setEditingPricingOption({ ...editingPricingOption, name: e.target.value })}
                     placeholder="Ej: Precio Base"
                   />
                 </div>
                 <div>
                   <Label htmlFor="editOptionBasePrice">Precio del Price Bean</Label>
                     <Input
                       id="editOptionBasePrice"
                     type="number"
                     step="0.01"
                       value={editingPricingOption.basePrice}
                       onChange={(e) => setEditingPricingOption({ ...editingPricingOption, basePrice: e.target.value })}
                     placeholder="10.00"
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setEditingPricingOption(null)}
                 >
                   Cancelar
                 </Button>
                 <Button onClick={() => handleUpdatePricingOption(editingPricingOption)}>
                   Actualizar Opción
                 </Button>
               </div>
             </div>
           </div>,
           document.body
         )}

         {/* Modal de Crear Variable - DENTRO DE LA SECCIÓN DE VARIABLES */}
         {isCreateVariableDialogOpen && typeof window !== 'undefined' && createPortal(
           <div 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0,0,0,0.8)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 999999,
               padding: '20px'
             }}
           >
             <div 
               style={{
                 backgroundColor: 'white',
                 padding: '30px',
                 borderRadius: '10px',
                 boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                 maxWidth: '500px',
                 width: '100%',
                 maxHeight: '90vh',
                 overflow: 'auto',
                 border: '3px solid red'
               }}
             >
               <div className="mb-4">
                 <h2 className="text-xl font-semibold text-gray-800">Crear Nueva Variable</h2>
               </div>
               
               <p className="text-gray-600 mb-6">
                 Agrega una nueva variable personalizable para este producto
               </p>
               
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="variableName">Nombre de la Variable *</Label>
                   <Input
                     id="variableName"
                     value={newVariable.name}
                     onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                     placeholder="Ej: Tamaño, Color, Sabor"
                   />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                   <div>
                     <Label htmlFor="variableQuantity">Cantidad</Label>
                     <Input
                       id="variableQuantity"
                       type="number"
                       min="1"
                       value={newVariable.quantity}
                       onChange={(e) => setNewVariable({ ...newVariable, quantity: Number(e.target.value) })}
                       placeholder="Máximo de opciones que puedes crear"
                     />
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       id="variableRequired"
                       checked={newVariable.required}
                       onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
                     />
                     <Label htmlFor="variableRequired">Obligatorio</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       id="variableCanMany"
                       checked={newVariable.canMany}
                       onChange={(e) => setNewVariable({ ...newVariable, canMany: e.target.checked })}
                     />
                     <Label htmlFor="variableCanMany">Permite múltiples</Label>
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="variableInstructions">Instrucciones</Label>
                   <Textarea
                     id="variableInstructions"
                     value={newVariable.instructions}
                     onChange={(e) => setNewVariable({ ...newVariable, instructions: e.target.value })}
                     placeholder="Instrucciones para el cliente..."
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 mt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setIsCreateVariableDialogOpen(false)}
                   disabled={isCreatingVariable}
                 >
                   Cancelar
                 </Button>
                 <Button 
                   onClick={handleCreateVariable}
                   disabled={isCreatingVariable}
                 >
                   {isCreatingVariable ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Creando...
                     </>
                   ) : (
                     'Crear Variable'
                   )}
                 </Button>
               </div>
             </div>
           </div>,
           document.body
         )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
               <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold">Productos</h1>
             <p className="text-muted-foreground">Gestiona tu catálogo de productos y categorías</p>
           </div>
         </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="visible">Activas</SelectItem>
                  <SelectItem value="hidden">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
                         <div className="flex items-center gap-2">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button
                     variant={viewMode === "grid" ? "default" : "outline"}
                     size="sm"
                     onClick={() => setViewMode("grid")}
                   >
                     <Grid3X3 className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>Vista en cuadrícula</p>
                 </TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button
                     variant={viewMode === "list" ? "default" : "outline"}
                     size="sm"
                     onClick={() => setViewMode("list")}
                   >
                     <List className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>Vista en lista</p>
                 </TooltipContent>
               </Tooltip>
              <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                    <DialogDescription>
                      Agrega una nueva categoría para organizar tus productos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoryName">Nombre</Label>
                        <Input
                          id="categoryName"
                          value={newCategory.categoryName}
                          onChange={(e) => setNewCategory({ ...newCategory, categoryName: e.target.value })}
                          placeholder="Ej: Hamburguesas"
                        />
                      </div>

                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Descripción</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Describe la categoría..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateCategory}>Crear Categoría</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map((category, index) => (
                <Card 
                  key={category?._id || `category-${index}`} 
                  className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                    category.status === 1 
                      ? 'border-l-green-500 hover:border-l-green-600 bg-green-50/30 hover:bg-green-50/50' 
                      : 'border-l-red-500 hover:border-l-red-600 bg-red-50/30 hover:bg-red-50/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${
                          category.status === 1 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <Package className="h-4 w-4" />
                        </div>
                        <Badge 
                          variant={category.status === 1 ? "default" : "destructive"}
                          className={`${
                            category.status === 1 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {category.status === 1 ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                      {category.categoryName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md max-h-20 overflow-y-auto">
                      <p className="whitespace-pre-wrap break-words">
                      {category.description || "Sin descripción"}
                    </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
                          <Package className="h-3 w-3" />
                        </div>
                        <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                        {getProductCount(category._id)} productos
                      </span>
                      </div>
                      <div className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                                <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                            className="flex-1 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                                onClick={() => {
                                  setEditingCategory(category)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar esta categoría</p>
                            </TooltipContent>
                          </Tooltip>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleToggleCategoryStatus(category._id)}
                            className={category.status === 1 
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200" 
                              : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            }
                          >
                            {category.status === 1 ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>{category.status === 1 ? "Desactivar categoría" : "Activar categoría"}</p>
                         </TooltipContent>
                       </Tooltip>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category, index) => (
                <Card 
                  key={category?._id || `category-${index}`}
                  className={`hover:shadow-md transition-all duration-200 border-l-4 ${
                    category.status === 1 
                      ? 'border-l-green-500 hover:border-l-green-600 bg-green-50/20 hover:bg-green-50/40' 
                      : 'border-l-red-500 hover:border-l-red-600 bg-red-50/20 hover:bg-red-50/40'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          category.status === 1 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-800">{category.categoryName}</h3>
                            <Badge 
                              variant={category.status === 1 ? "default" : "destructive"}
                              className={`${
                                category.status === 1 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {category.status === 1 ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mt-1">
                            {category.description || "Sin descripción"}
                          </p>
                          <div className="flex items-center gap-4 text-sm mt-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
                                <Package className="h-3 w-3" />
                              </div>
                              <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                              {getProductCount(category._id)} productos
                            </span>
                            </div>
                            <div className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                              Creada: {new Date(category.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                                             <div className="flex items-center gap-2">
                                                  <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar esta categoría</p>
                            </TooltipContent>
                          </Tooltip>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleToggleCategoryStatus(category._id)}
                             >
                               {category.status === 1 ? "Desactivar" : "Activar"}
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>{category.status === 1 ? "Desactivar categoría" : "Activar categoría"}</p>
                           </TooltipContent>
                         </Tooltip>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDeleteCategory(category._id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Eliminar esta categoría</p>
                           </TooltipContent>
                         </Tooltip>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
                     <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Buscar productos..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 w-80"
                 />
               </div>
                               <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="visible">Visibles</SelectItem>
                    <SelectItem value="hidden">Ocultos</SelectItem>
                  </SelectContent>
                </Select>
               <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                 <SelectTrigger className="w-48">
                   <Filter className="h-4 w-4 mr-2" />
                   <SelectValue placeholder="Filtrar por categoría" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todas las categorías</SelectItem>
                   {categories.filter(c => c.status === 1).map((category, index) => (
                     <SelectItem key={category?._id || `category-select-${index}`} value={category._id}>
                       {category.categoryName}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
                           </div>
                             <div className="flex items-center gap-2">
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant={productsViewMode === "grid" ? "default" : "outline"}
                       size="sm"
                       onClick={() => setProductsViewMode("grid")}
                     >
                       <Grid3X3 className="h-4 w-4" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p>Vista en cuadrícula</p>
                   </TooltipContent>
                 </Tooltip>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant={productsViewMode === "list" ? "default" : "outline"}
                       size="sm"
                       onClick={() => setProductsViewMode("list")}
                     >
                       <List className="h-4 w-4" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p>Vista en lista</p>
                   </TooltipContent>
                 </Tooltip>
                <Dialog open={isCreateProductDialogOpen} onOpenChange={setIsCreateProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Producto</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo producto a tu catálogo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Nombre del Producto</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Ej: Hamburguesa Clásica"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productPrice">Precio</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.pricing}
                        onChange={(e) => setNewProduct({ ...newProduct, pricing: Number.parseFloat(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCategory">Categoría</Label>
                      <Select
                        value={newProduct.categoryProductId}
                        onValueChange={(value) => setNewProduct({ ...newProduct, categoryProductId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c.status === 1).map((category, index) => (
                            <SelectItem key={category?._id || `category-select-${index}`} value={category._id}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="productDescription">Descripción</Label>
                    <Textarea
                      id="productDescription"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Describe tu producto..."
                    />
                  </div>
                    <div>
                      <Label htmlFor="productImage">Imagen del Producto</Label>
                      <div className="space-y-4">
                        {/* Opción 1: Subir archivo */}
                        <div>
                          <Label htmlFor="productImageFile" className="text-sm font-medium text-gray-700">
                            Subir desde PC
                          </Label>
                          <Input
                            id="productImageFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setImagePreview(URL.createObjectURL(file));
                                setNewProduct({ ...newProduct, imageUrl: '' }); // Limpiar URL si se sube archivo
                              }
                            }}
                            className="w-full"
                          />
                          {imagePreview && (
                            <div className="relative mt-2">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2"
                                onClick={() => {
                                  setSelectedImage(null);
                                  setImagePreview(null);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Separador */}
                        <div className="flex items-center">
                          <div className="flex-1 border-t border-gray-300"></div>
                          <span className="px-3 text-sm text-gray-500">O</span>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        
                        {/* Opción 2: URL */}
                        <div>
                          <Label htmlFor="productImageUrl" className="text-sm font-medium text-gray-700">
                            URL de la Imagen
                          </Label>
                        <Input
                          id="productImageUrl"
                          type="url"
                          value={newProduct.imageUrl || ''}
                            onChange={(e) => {
                              setNewProduct({ ...newProduct, imageUrl: e.target.value });
                              setSelectedImage(null); // Limpiar archivo si se usa URL
                              setImagePreview(null);
                            }}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="w-full"
                        />
                        {newProduct.imageUrl && (
                            <div className="relative mt-2">
                            <img
                              src={newProduct.imageUrl}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2"
                              onClick={() => setNewProduct({ ...newProduct, imageUrl: '' })}
                            >
                              ×
                            </Button>
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateProductDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateProduct}>Crear Producto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
              

              </div>
          </div>

                                            {productsViewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => {
                  return (
                    <Card 
                      key={product?._id || `product-${index}`} 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 ${
                        product.visibleItem 
                          ? 'border-l-green-500 hover:border-l-green-600 bg-green-50/30 hover:bg-green-50/50' 
                          : 'border-l-red-500 hover:border-l-red-600 bg-red-50/30 hover:bg-red-50/50'
                      }`}
                      onClick={() => handleViewProduct(product)}
                    >
                      <CardHeader className="pb-3">
                                                 <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             {product.url ? (
                               <img
                                 src={product.url}
                                 alt={product.name}
                                 className="w-8 h-8 object-cover rounded-lg border"
                               />
                             ) : (
                             <Package className={`h-5 w-5 ${
                               product.visibleItem ? 'text-green-600' : 'text-red-600'
                             }`} />
                             )}
                             <Badge 
                               variant={product.visibleItem ? "default" : "destructive"}
                               className={`${
                                 product.visibleItem 
                                   ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                   : 'bg-red-100 text-red-800 hover:bg-red-200'
                               }`}
                             >
                               {product.visibleItem ? "Visible" : "Oculto"}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {getCategoryName(product.categoryProductId)}
                             </Badge>
                           </div>
                         </div>
                         <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-md">
                          {product.description || "Sin descripción"}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            Bs. {product.pricing}
                          </span>
                          
                        </div>
                                                 <div className="flex flex-wrap gap-1 pt-2">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="flex-1 min-w-0 px-2"
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   setViewingProduct(product)
                                   setShowVariablesSection(true)
                                 }}
                               >
                                 <Eye className="h-3 w-3 mr-1" />
                                 <span className="hidden sm:inline">Ver Variables</span>
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Ver y gestionar variables de este producto</p>
                             </TooltipContent>
                           </Tooltip>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="px-2"
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   setEditingProduct(product)
                                 }}
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Editar producto</p>
                             </TooltipContent>
                           </Tooltip>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="px-2"
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   handleDuplicateProduct(product)
                                 }}
                               >
                                 <Copy className="h-3 w-3" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Duplicar producto</p>
                             </TooltipContent>
                           </Tooltip>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="px-2"
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   handleToggleProductVisibility(product._id)
                                 }}
                               >
                                 <Archive className="h-3 w-3" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>{product.visibleItem ? "Ocultar producto" : "Mostrar producto"}</p>
                             </TooltipContent>
                           </Tooltip>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="px-2"
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   handleDeleteProduct(product._id)
                                 }}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Eliminar producto</p>
                             </TooltipContent>
                           </Tooltip>
                         </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product, index) => {
                  return (
                    <Card 
                      key={product?._id || `product-${index}`} 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 ${
                        product.visibleItem 
                          ? 'border-l-green-500 hover:border-l-green-600 bg-green-50/20 hover:bg-green-50/40' 
                          : 'border-l-red-500 hover:border-l-red-600 bg-red-50/20 hover:bg-red-50/40'
                      }`}
                      onClick={() => handleViewProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {product.url ? (
                              <img
                                src={product.url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border"
                              />
                            ) : (
                            <Package className={`h-8 w-8 ${
                              product.visibleItem ? 'text-green-600' : 'text-red-600'
                            }`} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                <Badge 
                                  variant={product.visibleItem ? "default" : "destructive"}
                                  className={`${
                                    product.visibleItem 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  {product.visibleItem ? "Visible" : "Oculto"}
                                </Badge>
                                <Badge variant="outline">
                                  {getCategoryName(product.categoryProductId)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mt-1">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs mt-2">
                                <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                  Precio: Bs. {product.pricing}
                                </span>
                                <span className="text-gray-500">
                                  Creado: {new Date(product.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                                                     <div className="flex items-center gap-2">
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     setViewingProduct(product)
                                     setShowVariablesSection(true)
                                   }}
                                 >
                                   <Eye className="h-4 w-4 mr-2" />
                                   Ver Variables
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Ver y gestionar variables de este producto</p>
                               </TooltipContent>
                             </Tooltip>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     setEditingProduct(product)
                                   }}
                                 >
                                   <Edit className="h-4 w-4 mr-2" />
                                   Editar
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Editar producto</p>
                               </TooltipContent>
                             </Tooltip>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     handleDuplicateProduct(product)
                                   }}
                                 >
                                   <Copy className="h-4 w-4 mr-2" />
                                   Duplicar
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Duplicar producto</p>
                               </TooltipContent>
                             </Tooltip>
                                                        <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleProductVisibility(product._id)
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{product.visibleItem ? "Ocultar producto" : "Mostrar producto"}</p>
                              </TooltipContent>
                            </Tooltip>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     handleDeleteProduct(product._id)
                                   }}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Eliminar producto</p>
                               </TooltipContent>
                             </Tooltip>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
        </TabsContent>
      </Tabs>

             {/* Edit Product Dialog */}
       {editingProduct && (
         <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Editar Producto</DialogTitle>
               <DialogDescription>
                 Modifica los datos del producto
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div>
                 <Label htmlFor="editProductName">Nombre del Producto</Label>
                 <Input
                   id="editProductName"
                   value={editingProduct.name}
                   onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="editProductPrice">Precio</Label>
                   <Input
                     id="editProductPrice"
                     type="number"
                     step="0.01"
                     value={editingProduct.pricing || ""}
                     onChange={(e) => setEditingProduct({ ...editingProduct, pricing: e.target.value === "" ? "" : Number.parseFloat(e.target.value) })}
                   />
                 </div>
                 <div>
                   <Label htmlFor="editProductCategory">Categoría</Label>
                   <Select
                                              value={getCategoryId(editingProduct.categoryProductId)}
                     onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryProductId: value })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Selecciona una categoría" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories.filter(c => c.status === 1).map((category, index) => (
                         <SelectItem key={category?._id || `category-select-${index}`} value={category._id}>
                           {category.categoryName}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>
               <div>
                 <Label htmlFor="editProductDescription">Descripción</Label>
                 <Textarea
                   id="editProductDescription"
                   value={editingProduct.description}
                   onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                 />
               </div>
               <div>
                 <Label htmlFor="editProductImage">Imagen del Producto</Label>
                 <div className="space-y-4">
                   {/* Opción 1: Subir archivo */}
                   <div>
                     <Label htmlFor="editProductImageFile" className="text-sm font-medium text-gray-700">
                       Subir desde PC
                     </Label>
                     <Input
                       id="editProductImageFile"
                       type="file"
                       accept="image/*"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           setSelectedImage(file);
                           setImagePreview(URL.createObjectURL(file));
                           setEditingProduct({ ...editingProduct, url: '' }); // Limpiar URL si se sube archivo
                         }
                       }}
                       className="w-full"
                     />
                     {imagePreview && (
                       <div className="relative mt-2">
                         <img
                           src={imagePreview}
                           alt="Preview"
                           className="w-32 h-32 object-cover rounded-lg border"
                         />
                         <Button
                           type="button"
                           variant="destructive"
                           size="sm"
                           className="absolute -top-2 -right-2"
                           onClick={() => {
                             setSelectedImage(null);
                             setImagePreview(null);
                           }}
                         >
                           ×
                         </Button>
                       </div>
                     )}
                   </div>
                   
                   {/* Separador */}
                   <div className="flex items-center">
                     <div className="flex-1 border-t border-gray-300"></div>
                     <span className="px-3 text-sm text-gray-500">O</span>
                     <div className="flex-1 border-t border-gray-300"></div>
                   </div>
                   
                   {/* Opción 2: URL */}
                   <div>
                     <Label htmlFor="editProductImageUrl" className="text-sm font-medium text-gray-700">
                       URL de la Imagen
                     </Label>
                   <Input
                     id="editProductImageUrl"
                     type="url"
                     value={editingProduct.url || ''}
                       onChange={(e) => {
                         setEditingProduct({ ...editingProduct, url: e.target.value });
                         setSelectedImage(null); // Limpiar archivo si se usa URL
                         setImagePreview(null);
                       }}
                     placeholder="https://ejemplo.com/imagen.jpg"
                     className="w-full"
                   />
                   {editingProduct.url && (
                       <div className="relative mt-2">
                       <img
                         src={editingProduct.url}
                         alt="Preview"
                         className="w-32 h-32 object-cover rounded-lg border"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                         }}
                       />
                       <Button
                         type="button"
                         variant="destructive"
                         size="sm"
                         className="absolute -top-2 -right-2"
                         onClick={() => setEditingProduct({ ...editingProduct, url: '' })}
                       >
                         ×
                       </Button>
                     </div>
                   )}
                   </div>
                 </div>
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setEditingProduct(null)}>
                 Cancelar
               </Button>
               <Button onClick={() => handleUpdateProduct(editingProduct)}>
                 Actualizar Producto
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       )}

               {/* Edit Category Dialog */}
        {editingCategory && (
         <Dialog open={!!editingCategory} onOpenChange={(open: boolean) => {
           if (!open) {
             setEditingCategory(null)
           }
         }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>
                Modifica los datos de la categoría
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCategoryName">Nombre</Label>
                  <Input
                    id="editCategoryName"
                    value={editingCategory.categoryName}
                    onChange={(e) => setEditingCategory({ ...editingCategory, categoryName: e.target.value })}
                  />
                </div>

              </div>
              <div>
                <Label htmlFor="editCategoryDescription">Descripción</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                Cancelar
              </Button>
              <Button onClick={() => handleUpdateCategory(editingCategory)}>
                Actualizar Categoría
              </Button>
            </DialogFooter>
          </DialogContent>
                 </Dialog>
       )}
       
       
       {/* Create Pricing Option Dialog */}
       {isCreatePricingOptionDialogOpen && typeof window !== 'undefined' && createPortal(
         <div 
           style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             backgroundColor: 'rgba(0,0,0,0.8)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             zIndex: 999999,
             padding: '20px'
           }}
         >
           <div 
             style={{
               backgroundColor: 'white',
               padding: '30px',
               borderRadius: '10px',
               boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
               maxWidth: '500px',
               width: '100%',
               maxHeight: '90vh',
               overflow: 'auto',
               border: '2px solid #3b82f6'
             }}
           >
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-blue-600">Agregar Opción de Precio</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => {
                   setIsCreatePricingOptionDialogOpen(false)
                   setSelectedVariableForPricing(null)
                   setNewPricingOption({
                     name: "",
                     basePrice: ""
                   })
                 }}
                 className="h-8 w-8 p-0"
               >
                 ✕
               </Button>
             </div>
             
             <p className="text-gray-600 mb-4">
               Agrega una nueva opción de precio para la variable: <strong>{selectedVariableForPricing?.name}</strong>
             </p>
             
             
           <div className="space-y-4">
             <div>
                 <Label htmlFor="optionName">Nombre del Price Bean</Label>
               <Input
                 id="optionName"
                 value={newPricingOption.name}
                 onChange={(e) => setNewPricingOption({ ...newPricingOption, name: e.target.value })}
                   placeholder="Ej: Precio Base"
               />
             </div>
               <div>
                 <Label htmlFor="optionBasePrice">Precio del Price Bean</Label>
                 <Input
                     id="optionBasePrice"
                   type="number"
                   step="0.01"
                     value={newPricingOption.basePrice}
                     onChange={(e) => setNewPricingOption({ ...newPricingOption, basePrice: e.target.value })}
                   placeholder="10.00"
                 />
               </div>
             </div>
             
             <div className="flex gap-2 mt-6">
               <Button 
                 variant="outline" 
                 onClick={() => {
                   setIsCreatePricingOptionDialogOpen(false)
                   setSelectedVariableForPricing(null)
                   setNewPricingOption({
                     name: "",
                     basePrice: ""
                   })
                 }}
               >
                 Cancelar
               </Button>
               <Button 
                 onClick={handleCreatePricingOption}
               >
                 Agregar Opción
               </Button>
             </div>
           </div>
         </div>,
         document.body
       )}

     </div>
     </TooltipProvider>
   )
 }

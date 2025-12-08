'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductos, getTotalProductos, eliminarProducto } from '@/lib/supabase-queries'
import { showSuccess, showError, showConfirm } from '@/lib/swal'
import styles from './productos.module.css'

interface Product {
  id: string
  imagen: string | null
  nombre: string
  categoria: string
  estado: 'En Stock' | 'Bajo Stock' | 'Sin Stock'
  stock: number
  precio: string
}

const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'En Stock':
      return styles.statusEnStock
    case 'Bajo Stock':
      return styles.statusBajoStock
    case 'Sin Stock':
      return styles.statusSinStock
    default:
      return styles.statusEnStock
  }
}

const getEstadoFromStock = (stock: number): 'En Stock' | 'Bajo Stock' | 'Sin Stock' => {
  if (stock === 0) return 'Sin Stock'
  if (stock < 10) return 'Bajo Stock'
  return 'En Stock'
}

export default function ProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const itemsPerPage = 4

  // Función para recargar productos
  const reloadProductos = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      
      const productosData = await getProductos({
        search: searchTerm || undefined,
        limit: itemsPerPage,
        offset: offset
      })

      const total = await getTotalProductos({
        search: searchTerm || undefined
      })

      const formattedProducts: Product[] = (productosData || []).map((producto: any) => {
        const categoria = producto.categoria?.nombre || 'Sin categoría'
        const stock = producto.stock || 0
        const precioFinal = producto.descuento > 0 
          ? producto.precio * (1 - producto.descuento / 100)
          : producto.precio

        // Obtener imagen principal
        const imagenes = (producto.producto_imagenes || []) as Array<{ url: string; es_principal: boolean; orden: number }>
        // Ordenar por es_principal primero, luego por orden
        const imagenesOrdenadas = imagenes.sort((a, b) => {
          if (a.es_principal && !b.es_principal) return -1
          if (!a.es_principal && b.es_principal) return 1
          return a.orden - b.orden
        })
        const imagenUrl = imagenesOrdenadas[0]?.url || null
        
        // Debug: ver qué imágenes tenemos
        if (imagenes.length > 0 && !imagenUrl) {
          console.log('Producto con imágenes pero sin URL:', producto.nombre, imagenes)
        }

        return {
          id: producto.id,
          imagen: imagenUrl,
          nombre: producto.nombre,
          categoria: categoria,
          estado: getEstadoFromStock(stock),
          stock: stock,
          precio: `Bs. ${precioFinal.toFixed(2)}`
        }
      })

      setProducts(formattedProducts)
      setTotalProducts(total)
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos desde Supabase
  useEffect(() => {
    reloadProductos()
  }, [currentPage, searchTerm])

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Función para editar producto
  const handleEdit = (id: string) => {
    router.push(`/productos/editar/${id}`)
  }

  // Función para eliminar producto
  const handleDelete = async (id: string, nombre: string) => {
    const result = await showConfirm(
      '¿Eliminar producto?',
      `¿Estás seguro de que deseas eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    )

    if (!result.isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      await eliminarProducto(id)
      await showSuccess('Producto eliminado', 'El producto ha sido eliminado exitosamente')
      // Recargar productos
      await reloadProductos()
    } catch (error: any) {
      console.error('Error eliminando producto:', error)
      await showError('Error al eliminar', error?.message || 'Error desconocido al eliminar el producto')
    } finally {
      setDeletingId(null)
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts)
  const totalPages = Math.ceil(totalProducts / itemsPerPage)
  
  const pagesToShow = []
  const maxPagesToShow = 3
  let startPage = Math.max(1, currentPage - 1)
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inventario de Productos</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <label className={styles.searchWrapper}>
            <div className={styles.searchIconWrapper}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <Link href="/productos/categorias" className={styles.secondaryButton}>
            Gestionar Categorías
          </Link>
          <Link href="/productos/nuevo" className={styles.primaryButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>Agregar Producto</span>
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th className={styles.textCenter}>Stock</th>
                <th>Precio</th>
                <th className={styles.textCenter}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    No hay productos
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.imageContainer}>
                        {product.imagen ? (
                          <div 
                            className={styles.productImage}
                            style={{ backgroundImage: `url(${product.imagen})` }}
                          />
                        ) : (
                          <div className={`${styles.productImage} ${styles.placeholder}`}>
                            📷
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.productName}>{product.nombre}</td>
                    <td className={styles.category}>{product.categoria}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(product.estado)}`}>
                        {product.estado}
                      </span>
                    </td>
                    <td className={styles.stock}>{product.stock}</td>
                    <td className={styles.price}>{product.precio}</td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.actionButton} 
                          title="Editar producto"
                          onClick={() => handleEdit(product.id)}
                          disabled={loading || deletingId === product.id}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.delete}`}
                          title="Eliminar producto"
                          onClick={() => handleDelete(product.id, product.nombre)}
                          disabled={loading || deletingId === product.id}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <nav className={styles.pagination} aria-label="Table navigation">
          <span className={styles.paginationInfo}>
            {loading ? (
              'Cargando...'
            ) : totalProducts > 0 ? (
              <>
                Mostrando <strong>{startIndex + 1}-{endIndex}</strong> de <strong>{totalProducts}</strong>
              </>
            ) : (
              'No hay productos'
            )}
          </span>
          <ul className={styles.paginationControls}>
            <li>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                aria-label="Anterior"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              </button>
            </li>
            {pagesToShow.map((page) => (
              <li key={page}>
                <button
                  className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            ))}
            {totalPages > Math.max(...pagesToShow) && (
              <>
                <li>
                  <span className={styles.paginationEllipsis}>...</span>
                </li>
                <li>
                  <button
                    className={styles.paginationButton}
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={loading}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                aria-label="Siguiente"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

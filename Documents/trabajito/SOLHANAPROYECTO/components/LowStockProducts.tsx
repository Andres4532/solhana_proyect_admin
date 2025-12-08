'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getProductosBajoStock } from '@/lib/supabase-queries'
import styles from './LowStockProducts.module.css'

interface Product {
  name: string
  sku: string
  stock: number
  image: string
}

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProductosBajoStock(5, 10)
        setProducts(data)
      } catch (error: any) {
        console.error('Error cargando productos con bajo stock:', error)
        console.error('Detalles:', {
          message: error?.message,
          code: error?.code,
          details: error?.details
        })
        // No mostrar error al usuario, solo dejar la lista vacía
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Productos con Bajo Stock</h2>
        <Link href="/productos" className={styles.link}>Ver todo</Link>
      </div>
      <div className={styles.list}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>No hay productos con bajo stock</div>
        ) : (
          products.map((product) => (
            <div key={product.sku} className={styles.item}>
              {product.image && product.image.startsWith('http') ? (
                <img src={product.image} alt={product.name} className={styles.image} />
              ) : (
                <div className={styles.image}>{product.image}</div>
              )}
              <div className={styles.info}>
                <div className={styles.name}>{product.name}</div>
                <div className={styles.sku}>SKU: {product.sku}</div>
              </div>
              <div className={styles.stockContainer}>
                <div className={`${styles.stock} ${product.stock < 5 ? '' : styles.stockYellow}`}>
                  {product.stock}
                </div>
                <div className={styles.stockLabel}>restantes</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}




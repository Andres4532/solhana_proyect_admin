// ============================================
// EJEMPLOS DE USO DE SUPABASE
// ============================================

// ============================================
// EJEMPLO 1: Obtener productos en una página
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { getProductosCatalogo } from '@/lib/supabase-queries'

export default function ProductosEjemplo() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargarProductos() {
      try {
        const data = await getProductosCatalogo({
          limit: 12,
          es_best_seller: true
        })
        setProductos(data)
      } catch (err) {
        setError(err.message)
        console.error('Error cargando productos:', err)
      } finally {
        setLoading(false)
      }
    }
    cargarProductos()
  }, [])

  if (loading) return <div>Cargando productos...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Productos</h1>
      {productos.map(producto => (
        <div key={producto.id}>
          <h3>{producto.nombre}</h3>
          <p>${producto.precio_final}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 2: Carrito de compras
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { getCarrito, agregarAlCarrito, eliminarDelCarrito } from '@/lib/supabase-queries'
import { useSessionId } from '@/hooks/useSession'

export default function CarritoEjemplo() {
  const sessionId = useSessionId()
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    
    async function cargarCarrito() {
      try {
        const data = await getCarrito(undefined, sessionId)
        setCarrito(data)
      } catch (err) {
        console.error('Error cargando carrito:', err)
      } finally {
        setLoading(false)
      }
    }
    cargarCarrito()
  }, [sessionId])

  const agregarProducto = async (productoId: string, precio: number) => {
    if (!sessionId) return
    
    try {
      await agregarAlCarrito({
        session_id: sessionId,
        producto_id: productoId,
        cantidad: 1,
        precio_unitario: precio
      })
      // Recargar carrito
      const data = await getCarrito(undefined, sessionId)
      setCarrito(data)
    } catch (err) {
      console.error('Error agregando al carrito:', err)
    }
  }

  const eliminarProducto = async (itemId: string) => {
    try {
      await eliminarDelCarrito(itemId)
      // Recargar carrito
      const data = await getCarrito(undefined, sessionId)
      setCarrito(data)
    } catch (err) {
      console.error('Error eliminando del carrito:', err)
    }
  }

  if (loading) return <div>Cargando carrito...</div>

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div>
      <h2>Carrito ({carrito.length} items)</h2>
      {carrito.map(item => (
        <div key={item.id}>
          <span>{item.producto_nombre}</span>
          <span>Cantidad: {item.cantidad}</span>
          <span>${item.subtotal}</span>
          <button onClick={() => eliminarProducto(item.id)}>Eliminar</button>
        </div>
      ))}
      <div>Total: ${total}</div>
    </div>
  )
}

// ============================================
// EJEMPLO 3: Crear un pedido
// ============================================

'use client'

import { useState } from 'react'
import { crearPedido, limpiarCarrito } from '@/lib/supabase-queries'
import { useSessionId } from '@/hooks/useSession'

export default function CheckoutEjemplo() {
  const sessionId = useSessionId()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    metodo_pago: 'Efectivo'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aquí deberías obtener los items del carrito primero
      const items = [
        {
          producto_id: 'uuid-producto',
          nombre_producto: 'Producto Ejemplo',
          precio_unitario: 100,
          cantidad: 1,
          subtotal: 100
        }
      ]

      await crearPedido({
        nombre_cliente: formData.nombre,
        apellido_cliente: formData.apellido,
        telefono_cliente: formData.telefono,
        email_cliente: formData.email,
        subtotal: 100,
        total: 100,
        metodo_pago: formData.metodo_pago,
        ciudad_envio: formData.ciudad,
        direccion_completa: formData.direccion,
        items
      })

      // Limpiar carrito después de crear el pedido
      if (sessionId) {
        await limpiarCarrito(undefined, sessionId)
      }

      alert('Pedido creado exitosamente')
    } catch (error) {
      console.error('Error creando pedido:', error)
      alert('Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <select
        value={formData.ciudad}
        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
        required
      >
        <option value="">Selecciona ciudad</option>
        <option value="La Paz">La Paz</option>
        <option value="Santa Cruz">Santa Cruz</option>
        <option value="Cochabamba">Cochabamba</option>
      </select>
      <textarea
        placeholder="Dirección completa"
        value={formData.direccion}
        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Procesando...' : 'Completar Pedido'}
      </button>
    </form>
  )
}

// ============================================
// EJEMPLO 4: Filtros de productos
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { getProductosCatalogo, getCategorias } from '@/lib/supabase-queries'

export default function ProductosConFiltros() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({
    categoria_id: '',
    tipo_producto: '',
    precio_min: 0,
    precio_max: 1000,
    search: ''
  })

  useEffect(() => {
    async function cargarCategorias() {
      const data = await getCategorias()
      setCategorias(data)
    }
    cargarCategorias()
  }, [])

  useEffect(() => {
    async function cargarProductos() {
      try {
        const data = await getProductosCatalogo({
          categoria_id: filtros.categoria_id || undefined,
          tipo_producto: filtros.tipo_producto || undefined,
          precio_min: filtros.precio_min,
          precio_max: filtros.precio_max,
          search: filtros.search || undefined
        })
        setProductos(data)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    cargarProductos()
  }, [filtros])

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Buscar..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        />
        <select
          value={filtros.categoria_id}
          onChange={(e) => setFiltros({ ...filtros, categoria_id: e.target.value })}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio mínimo"
          value={filtros.precio_min}
          onChange={(e) => setFiltros({ ...filtros, precio_min: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={filtros.precio_max}
          onChange={(e) => setFiltros({ ...filtros, precio_max: Number(e.target.value) })}
        />
      </div>
      <div>
        {productos.map(producto => (
          <div key={producto.id}>
            <h3>{producto.nombre}</h3>
            <p>${producto.precio_final}</p>
          </div>
        ))}
      </div>
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getPedidoById } from '@/lib/supabase-queries'
import styles from './detalle.module.css'

interface OrderItem {
  id: string
  nombre: string
  imagen: string
  sku: string
  detalles: string
  precio: string
  cantidad: number
}

interface OrderHistory {
  estado: string
  fecha: string
  descripcion: string
  icono: 'check' | 'hourglass' | 'truck'
  completado: boolean
}

interface OrderDetail {
  id: string
  estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado'
  items: OrderItem[]
  subtotal: string
  descuento: string
  total: string
  cliente: {
    nombre: string
    email: string
    telefono: string
  }
  direccionEnvio: {
    calle: string
    ciudad: string
    pais: string
    metodo: string
  }
  direccionFacturacion: string
  historial: OrderHistory[]
}


const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'Pendiente':
      return styles.statusPendiente
    case 'Procesando':
      return styles.statusProcesando
    case 'Enviado':
      return styles.statusEnviado
    case 'Completado':
      return styles.statusCompletado
    case 'Cancelado':
      return styles.statusCancelado
    default:
      return styles.statusPendiente
  }
}

const getHistoryIconName = (icono: string) => {
  switch (icono) {
    case 'check':
      return 'check'
    case 'hourglass':
      return 'hourglass_top'
    case 'truck':
      return 'local_shipping'
    default:
      return 'check'
  }
}

export default function DetallePedidoPage() {
  console.log('🚀 Componente DetallePedidoPage renderizado')
  
  const params = useParams()
  console.log('📋 Params recibidos:', params)
  
  const orderId = params?.id as string
  console.log('🆔 OrderId extraído:', orderId)
  
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Render inicial - validar orderId
  if (!orderId || orderId === 'undefined' || orderId === 'null') {
    console.log('⚠️ OrderId inválido, mostrando mensaje de error')
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Error</h1>
          <p>No se proporcionó un ID de pedido válido.</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            Params recibidos: {JSON.stringify(params)}
          </p>
          <Link href="/pedidos" className={styles.backLink}>
            ← Volver a Pedidos
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    console.log('🔄 useEffect ejecutado, orderId:', orderId)
    
    async function loadOrder() {
      console.log('📞 Función loadOrder llamada')
      
      if (!orderId) {
        console.error('❌ No se proporcionó orderId')
        setError('No se proporcionó un ID de pedido')
        setLoading(false)
        return
      }

      // Limpiar el ID: remover # si existe
      const cleanOrderId = orderId.replace(/^#/, '')
      console.log('🔍 ID original:', orderId, 'ID limpio:', cleanOrderId)
      
      setLoading(true)
      setError(null)

      try {
        const pedidoData = await getPedidoById(cleanOrderId)
        
        console.log('✅ Pedido data recibido:', pedidoData)
        
        if (!pedidoData) {
          console.log('⚠️ No se encontró el pedido con ID:', orderId)
          setOrder(null)
          setError(`No se encontró el pedido con ID: ${orderId}`)
          return
        }

        // Verificar si items viene como array o como objeto
        let itemsArray = pedidoData.items
        if (!Array.isArray(itemsArray)) {
          // Si items no es un array, intentar obtenerlo de otra forma
          itemsArray = []
        }

        console.log('Items del pedido:', itemsArray)

        // Transformar datos de Supabase al formato esperado
        const items: OrderItem[] = itemsArray.map((item: any) => {
          // Obtener detalles de variante si existe
          let detalles = ''
          if (item.variante && item.variante.atributos) {
            if (typeof item.variante.atributos === 'object') {
              detalles = Object.entries(item.variante.atributos)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
            }
          }

          // Obtener imagen del producto
          let imagen = '/api/placeholder/80/80'
          if (item.producto) {
            // Si el producto tiene imágenes en producto_imagenes
            if (item.producto.imagenes && Array.isArray(item.producto.imagenes) && item.producto.imagenes.length > 0) {
              // Ordenar: primero la principal, luego por orden
              const imagenesOrdenadas = [...item.producto.imagenes].sort((a, b) => {
                if (a.es_principal && !b.es_principal) return -1
                if (!a.es_principal && b.es_principal) return 1
                return (a.orden || 0) - (b.orden || 0)
              })
              imagen = imagenesOrdenadas[0]?.url || imagen
            }
          }
          
          // Si hay variante con imagen, usar esa
          if (item.variante && item.variante.imagen_url) {
            imagen = item.variante.imagen_url
          }

          return {
            id: item.id,
            nombre: item.nombre_producto || 'Producto',
            imagen,
            sku: item.sku || item.producto?.sku || 'N/A',
            detalles,
            precio: `Bs. ${(item.precio_unitario || 0).toFixed(2)}`,
            cantidad: item.cantidad || 1
          }
        })

        // Generar historial desde pedido_historial o crear uno básico
        const historial: OrderHistory[] = (pedidoData.historial || []).map((h: any) => ({
          estado: h.estado || 'Actualización',
          fecha: h.fecha ? new Date(h.fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '',
          descripcion: h.descripcion || h.comentario || '',
          icono: h.estado?.toLowerCase().includes('enviado') ? 'truck' as const :
                 h.estado?.toLowerCase().includes('pago') ? 'check' as const :
                 'hourglass' as const,
          completado: h.completado !== false
        }))

        // Si no hay historial, crear uno básico
        if (historial.length === 0) {
          historial.push({
            estado: 'Pedido Creado',
            fecha: new Date(pedidoData.fecha_pedido || pedidoData.created_at).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            descripcion: 'El pedido ha sido creado.',
            icono: 'check',
            completado: true
          })
        }

        const orderDetail: OrderDetail = {
          id: pedidoData.numero_pedido || pedidoData.id.slice(0, 8),
          estado: (pedidoData.estado || 'Pendiente') as OrderDetail['estado'],
          items,
          subtotal: `Bs. ${(pedidoData.subtotal || 0).toFixed(2)}`,
          descuento: pedidoData.descuento ? `-Bs. ${pedidoData.descuento.toFixed(2)}` : 'Bs. 0.00',
          total: `Bs. ${(pedidoData.total || 0).toFixed(2)}`,
          cliente: {
            nombre: `${pedidoData.nombre_cliente || ''} ${pedidoData.apellido_cliente || ''}`.trim() || 'Cliente',
            email: pedidoData.email_cliente || '',
            telefono: pedidoData.telefono_cliente || ''
          },
          direccionEnvio: {
            calle: pedidoData.direccion_completa || '',
            ciudad: pedidoData.ciudad_envio || '',
            pais: 'Bolivia',
            metodo: pedidoData.metodo_envio || 'Envío Estándar'
          },
          direccionFacturacion: pedidoData.direccion_completa || 'Igual que la dirección de envío',
          historial
        }

        setOrder(orderDetail)
        setError(null)
      } catch (error: any) {
        console.error('❌ Error cargando pedido:', error)
        console.error('❌ Detalles del error:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        })
        setError(`Error al cargar el pedido: ${error?.message || 'Error desconocido'}`)
        setOrder(null)
        // No mostrar alerta, solo guardar el error para mostrarlo en la UI
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  // Siempre mostrar algo mientras carga
  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Cargando pedido...</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            ID buscado: <strong>{orderId}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            Si esta pantalla permanece mucho tiempo, verifica la consola del navegador (F12)
          </p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>No se pudo cargar el pedido</h1>
          {error && (
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
          )}
          {!error && (
            <p>El pedido con ID "{orderId}" no existe en la base de datos.</p>
          )}
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            Verifica que el ID sea correcto o que el pedido haya sido creado.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/pedidos" className={styles.backLink}>
              ← Volver a Pedidos
            </Link>
          </div>
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
            <strong>Información de depuración:</strong>
            <br />
            ID buscado: {orderId}
            <br />
            Tipo: {typeof orderId}
            <br />
            Longitud: {orderId?.length || 0}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/pedidos" className={styles.breadcrumbLink}>Pedidos</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>#{order.id}</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Pedido #{order.id}</h1>
          <span className={`${styles.statusBadge} ${getStatusClass(order.estado)}`}>
            {order.estado}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            <span>Imprimir Factura</span>
          </button>
          <button className={styles.actionButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>archive</span>
            <span>Archivar</span>
          </button>
        </div>
      </div>

      {/* Contenido principal - Dos columnas */}
      <div className={styles.content}>
        {/* Columna izquierda */}
        <div className={styles.leftColumn}>
          {/* Artículos del Pedido */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Artículos del Pedido</h2>
            </div>
            <div className={styles.itemsList}>
              {order.items.map((item) => {
                const hasImage = item.imagen && item.imagen !== '/api/placeholder/80/80'
                return (
                  <div key={item.id} className={styles.itemCard}>
                    {hasImage ? (
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className={styles.productImage}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className={styles.placeholderImage}></div>
                    )}
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.nombre}</h3>
                      <p className={styles.itemSku}>
                        SKU: {item.sku}
                        {item.detalles && ` | ${item.detalles}`}
                      </p>
                    </div>
                    <div className={styles.itemPrice}>
                      <div className={styles.price}>{item.precio}</div>
                      <div className={styles.quantity}>Cant: {item.cantidad}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Resumen Financiero</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span className={styles.summaryValue}>{order.subtotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Descuento %</span>
                  <span className={styles.summaryValue}>{order.descuento}</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Total</span>
                  <span className={styles.summaryTotal}>{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial del Pedido */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Historial del Pedido</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.historyTimeline}>
                {order.historial.map((entry, index) => {
                  const isLast = index === order.historial.length - 1
                  const isInactive = !entry.completado && isLast
                  return (
                    <div key={index} className={styles.historyItem}>
                      <div className={`${styles.historyIcon} ${isInactive ? styles.inactive : entry.completado ? styles.completed : styles.pending}`}>
                        <span className="material-symbols-outlined">{getHistoryIconName(entry.icono)}</span>
                      </div>
                      <div className={styles.historyContent}>
                        <h4 className={`${styles.historyStatus} ${isInactive ? styles.inactive : ''}`}>
                          {entry.estado}
                        </h4>
                        {entry.fecha && (
                          <time className={styles.historyDate}>{entry.fecha}</time>
                        )}
                        <p className={`${styles.historyDescription} ${isInactive ? styles.inactive : ''}`}>
                          {entry.descripcion}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className={styles.rightColumn}>
          {/* Cliente y Envío */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Cliente y Envío</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.infoBlock}>
                <div className={styles.infoHeader}>
                  <p className={styles.infoLabel}>Cliente</p>
                  <Link href="#" className={styles.profileLink}>Ver perfil</Link>
                </div>
                <p className={styles.infoValue}>{order.cliente.nombre}</p>
                <p className={styles.infoValue}>{order.cliente.email}</p>
                <p className={styles.infoValue}>{order.cliente.telefono}</p>
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Dirección de Envío</p>
                <address className={styles.infoValue} style={{ fontStyle: 'normal' }}>
                  {order.direccionEnvio.calle}
                  {order.direccionEnvio.ciudad && <><br />{order.direccionEnvio.ciudad}</>}
                  {order.direccionEnvio.pais && <><br />{order.direccionEnvio.pais}</>}
                </address>
                <p className={styles.shippingMethod}>
                  <span className={styles.shippingMethodLabel}>Método:</span> {order.direccionEnvio.metodo}
                </p>
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Dirección de Facturación</p>
                <p className={styles.infoValue}>{order.direccionFacturacion}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Acciones</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.actions}>
                <div className={styles.actionGroup}>
                  <label htmlFor="order-status" className={styles.actionLabel}>Cambiar Estado</label>
                  <select id="order-status" className={styles.statusSelect} defaultValue={order.estado}>
                    <option>Pendiente</option>
                    <option>Pagado</option>
                    <option>Enviado</option>
                    <option>Completado</option>
                    <option>Cancelado</option>
                  </select>
                </div>
                <button className={styles.primaryButton}>
                  Marcar como Pagado
                </button>
                <button className={styles.dangerButton}>
                  Cancelar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


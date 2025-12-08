'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUltimosPedidos } from '@/lib/supabase-queries'
import styles from './OrdersTable.module.css'

interface Order {
  id: string
  cliente: string
  fecha: string
  total: string
  estado: 'Enviado' | 'Procesando' | 'Cancelado' | 'Pendiente' | 'Completado'
}

const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'Enviado':
      return styles.statusEnviado
    case 'Completado':
      return styles.statusCompletado
    case 'Procesando':
      return styles.statusProcesando
    case 'Cancelado':
      return styles.statusCancelado
    case 'Pendiente':
      return styles.statusPendiente
    default:
      return styles.statusPendiente
  }
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getUltimosPedidos(5)
        setOrders(data)
      } catch (error) {
        console.error('Error cargando pedidos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Últimos Pedidos</h2>
        <Link href="/pedidos" className={styles.link}>Ver todo</Link>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID PEDIDO</th>
              <th>CLIENTE</th>
              <th>FECHA</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  No hay pedidos
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.id}>{order.id}</td>
                  <td>{order.cliente}</td>
                  <td>{order.fecha}</td>
                  <td className={styles.total}>{order.total}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(order.estado)}`}>
                      <span className={styles.statusDot} />
                      {order.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


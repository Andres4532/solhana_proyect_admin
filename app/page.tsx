'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import KPICard from '@/components/KPICard'
import OrdersTable from '@/components/OrdersTable'
import TopProducts from '@/components/TopProducts'
import SalesChart from '@/components/SalesChart'
import LowStockProducts from '@/components/LowStockProducts'
import { getDashboardKPIs } from '@/lib/supabase-queries'
import styles from './dashboard.module.css'

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    ventasTotales: 0,
    totalPedidos: 0,
    cambioVentas: 0,
    cambioPedidos: 0,
    visitantesUnicos: 0,
    cambioVisitantes: 0,
    tasaConversion: 0,
    cambioConversion: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadKPIs() {
      try {
        const data = await getDashboardKPIs()
        setKpis(data)
      } catch (error) {
        console.error('Error cargando KPIs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadKPIs()
  }, [])

  const formatCurrency = (value: number) => {
    return `Bs. ${value.toFixed(2)}`
  }

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toString()
  }

  return (
    <>
      <Header />
      <div className={styles.content}>
        <div className={styles.kpiGrid}>
          <KPICard
            title="Ventas Totales"
            value={loading ? 'Cargando...' : formatCurrency(kpis.ventasTotales)}
            change={`${kpis.cambioVentas >= 0 ? '+' : ''}${kpis.cambioVentas.toFixed(1)}%`}
            isPositive={kpis.cambioVentas >= 0}
          />
          <KPICard
            title="Pedidos Recibidos"
            value={loading ? 'Cargando...' : kpis.totalPedidos.toString()}
            change={`${kpis.cambioPedidos >= 0 ? '+' : ''}${kpis.cambioPedidos.toFixed(1)}%`}
            isPositive={kpis.cambioPedidos >= 0}
          />
          <KPICard
            title="Visitantes Únicos"
            value={loading ? 'Cargando...' : formatNumber(kpis.visitantesUnicos)}
            change={`${kpis.cambioVisitantes >= 0 ? '+' : ''}${kpis.cambioVisitantes.toFixed(1)}%`}
            isPositive={kpis.cambioVisitantes >= 0}
          />
          <KPICard
            title="Tasa de Conversión"
            value={loading ? 'Cargando...' : `${kpis.tasaConversion.toFixed(1)}%`}
            change={`${kpis.cambioConversion >= 0 ? '+' : ''}${kpis.cambioConversion.toFixed(1)}%`}
            isPositive={kpis.cambioConversion >= 0}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.col2}>
            <OrdersTable />
          </div>
          <div className={styles.col1}>
            <TopProducts />
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.col2}>
            <SalesChart />
          </div>
          <div className={styles.col1}>
            <LowStockProducts />
          </div>
        </div>
      </div>
    </>
  )
}

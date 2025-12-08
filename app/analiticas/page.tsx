'use client'

import { useState, useEffect } from 'react'
import KPICard from '@/components/KPICard'
import { getReportesKPIs, getVentasPorDia, getProductosMasVendidosReporte, getVentasPorCategoria } from '@/lib/supabase-queries'
import styles from './analiticas.module.css'

interface TopProduct {
  sku: string
  nombre: string
  unidades: number
  ingresos: string
}

export default function AnaliticasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'Hoy' | 'Últimos 7 días' | 'Este Mes' | 'Rango Personalizado'>('Este Mes')
  const [kpis, setKpis] = useState({
    ventasTotales: 0,
    totalPedidos: 0,
    valorPromedioPedido: 0,
    cambioVentas: 0,
    cambioPedidos: 0,
    cambioValorPromedio: 0,
    tasaConversion: 0,
    cambioConversion: 0
  })
  const [ventasPorDia, setVentasPorDia] = useState<Array<{ fecha: string, total: number }>>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [ventasPorCategoria, setVentasPorCategoria] = useState<Array<{ nombre: string, unidades: number, porcentaje: number }>>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      // Si es "Rango Personalizado", no cargar datos hasta que se seleccionen fechas
      if (selectedPeriod === 'Rango Personalizado') {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [kpisData, ventasData, productosData, categoriasData] = await Promise.all([
          getReportesKPIs(selectedPeriod),
          getVentasPorDia(selectedPeriod),
          getProductosMasVendidosReporte(10),
          getVentasPorCategoria(selectedPeriod)
        ])

        setKpis(kpisData)
        setVentasPorDia(ventasData)
        
        // Formatear productos más vendidos
        const formattedProducts: TopProduct[] = productosData.map(p => ({
          sku: p.sku,
          nombre: p.nombre,
          unidades: p.unidades,
          ingresos: `Bs. ${p.ingresos.toFixed(2)}`
        }))
        setTopProducts(formattedProducts)
        setVentasPorCategoria(categoriasData)
      } catch (error) {
        console.error('Error cargando reportes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedPeriod])

  // Generar path del gráfico de ventas
  const generateSalesPath = () => {
    if (ventasPorDia.length === 0) {
      return 'M 0 180 L 600 180'
    }

    const maxValue = Math.max(...ventasPorDia.map(v => v.total), 1)
    const puntos = ventasPorDia.length
    const ancho = 600
    const alto = 180
    const padding = 20

    const path = ventasPorDia.map((venta, index) => {
      const x = (index / (puntos - 1)) * (ancho - padding * 2) + padding
      const y = alto - (venta.total / maxValue) * (alto - padding * 2) - padding
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    return path
  }

  // Generar datos para gráfico de dona
  const generateDonutData = () => {
    if (ventasPorCategoria.length === 0) {
      return {
        total: 0,
        segments: []
      }
    }

    const total = ventasPorCategoria.reduce((sum, c) => sum + c.unidades, 0)
    const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4']
    const radius = 80
    const circumference = 2 * Math.PI * radius
    
    let currentOffset = 0
    const segments = ventasPorCategoria.slice(0, 3).map((cat, index) => {
      const porcentaje = cat.porcentaje / 100
      const dashLength = circumference * porcentaje
      const dashOffset = -currentOffset
      currentOffset += dashLength
      
      return {
        color: colors[index % colors.length],
        dashArray: `${dashLength} ${circumference}`,
        dashOffset
      }
    })

    return { total, segments }
  }

  const donutData = generateDonutData()

  const formatCurrency = (value: number) => {
    return `Bs. ${value.toFixed(2)}`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES')
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Reportes y Analíticas</h1>
          <p className={styles.subtitle}>
            Consulta métricas clave y el rendimiento de tu tienda.
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateFilters}>
            <button
              className={`${styles.dateButton} ${selectedPeriod === 'Hoy' ? styles.active : ''}`}
              onClick={() => setSelectedPeriod('Hoy')}
            >
              Hoy
            </button>
            <button
              className={`${styles.dateButton} ${selectedPeriod === 'Últimos 7 días' ? styles.active : ''}`}
              onClick={() => setSelectedPeriod('Últimos 7 días')}
            >
              Últimos 7 días
            </button>
            <button
              className={`${styles.dateButton} ${selectedPeriod === 'Este Mes' ? styles.active : ''}`}
              onClick={() => setSelectedPeriod('Este Mes')}
            >
              Este Mes
            </button>
            <button
              className={`${styles.dateButton} ${selectedPeriod === 'Rango Personalizado' ? styles.active : ''}`}
              onClick={() => setSelectedPeriod('Rango Personalizado')}
            >
              Rango Personalizado
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
            </button>
          </div>
          <button className={styles.exportButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            <span className="truncate">Exportar Reporte</span>
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <KPICard
          title="Ventas Totales"
          value={loading ? 'Cargando...' : formatCurrency(kpis.ventasTotales)}
          change={`${kpis.cambioVentas >= 0 ? '+' : ''}${kpis.cambioVentas.toFixed(1)}%`}
          isPositive={kpis.cambioVentas >= 0}
        />
        <KPICard
          title="Pedidos"
          value={loading ? 'Cargando...' : formatNumber(kpis.totalPedidos)}
          change={`${kpis.cambioPedidos >= 0 ? '+' : ''}${kpis.cambioPedidos.toFixed(1)}%`}
          isPositive={kpis.cambioPedidos >= 0}
        />
        <KPICard
          title="Tasa de Conversión"
          value={loading ? 'Cargando...' : `${kpis.tasaConversion.toFixed(2)}%`}
          change={`${kpis.cambioConversion >= 0 ? '+' : ''}${kpis.cambioConversion.toFixed(1)}%`}
          isPositive={kpis.cambioConversion >= 0}
        />
        <KPICard
          title="Valor Promedio de Pedido"
          value={loading ? 'Cargando...' : formatCurrency(kpis.valorPromedioPedido)}
          change={`${kpis.cambioValorPromedio >= 0 ? '+' : ''}${kpis.cambioValorPromedio.toFixed(1)}%`}
          isPositive={kpis.cambioValorPromedio >= 0}
        />
      </div>

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Línea - Ventas */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Ventas a lo Largo del Tiempo</h3>
            <p className={styles.chartSubtitle}>Rendimiento para Este Mes</p>
          </div>
          <div className={styles.lineChart}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Cargando gráfico...</div>
            ) : (
              <svg viewBox="0 0 600 200" className={styles.chartSvg}>
                <defs>
                  <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${generateSalesPath()} L 600 180 L 0 180 Z`}
                  fill="url(#salesGradient)"
                />
                <path
                  d={generateSalesPath()}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Gráfico de Dona - Categorías */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Categorías Principales</h3>
          </div>
          <div className={styles.donutChartContainer}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Cargando gráfico...</div>
            ) : (
              <>
                <div className={styles.donutChart}>
                  <svg viewBox="0 0 36 36" className={styles.donutSvg}>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.91549430918954"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-blue-200"
                    />
                    {donutData.segments.map((segment, index) => {
                      const colors = ['#a855f7', '#22c55e', '#3b82f6']
                      const percentages = ventasPorCategoria.slice(0, 3).map(c => c.porcentaje)
                      let offset = 0
                      for (let i = 0; i < index; i++) {
                        offset += percentages[i] || 0
                      }
                      const dashArray = `${(percentages[index] || 0) * 100 / 100}, 100`
                      const dashOffset = -offset
                      return (
                        <circle
                          key={index}
                          cx="18"
                          cy="18"
                          r="15.91549430918954"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="3"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                        />
                      )
                    })}
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {formatNumber(donutData.total)}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
                      Unidades
                    </span>
                  </div>
                </div>
                <div className={styles.legend}>
                  {ventasPorCategoria.slice(0, 3).map((cat, index) => {
                    const colors = ['#a855f7', '#22c55e', '#3b82f6']
                    return (
                      <div key={cat.nombre} className={styles.legendItem}>
                        <span>
                          <div className={styles.legendColor} style={{ backgroundColor: colors[index % colors.length] }}></div>
                          {cat.nombre}
                        </span>
                        <span className={styles.legendPercent}>{cat.porcentaje.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Productos Más Vendidos */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h3 className={styles.tableTitle}>Productos Más Vendidos</h3>
            <p className={styles.tableSubtitle}>
              Productos con las ventas más altas este mes.
            </p>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Nombre del Producto</th>
                <th scope="col">Unidades Vendidas</th>
                <th scope="col">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    No hay productos vendidos
                  </td>
                </tr>
              ) : (
                topProducts.map((product, index) => (
                  <tr key={product.sku}>
                    <td className={styles.sku}>{product.sku}</td>
                    <th scope="row" className={styles.productName}>{product.nombre}</th>
                    <td className={styles.units}>{formatNumber(product.unidades)}</td>
                    <td className={styles.revenue}>{product.ingresos}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { getVentasPorPeriodo } from '@/lib/supabase-queries'
import styles from './SalesChart.module.css'

const timeframes: ('Hoy' | 'Semana' | 'Mes')[] = ['Hoy', 'Semana', 'Mes']

export default function SalesChart() {
  const [activeTimeframe, setActiveTimeframe] = useState<'Hoy' | 'Semana' | 'Mes'>('Semana')
  const [ventas, setVentas] = useState({ total: 0, cambio: 0, ventasPorDia: {} as { [key: string]: number } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVentas() {
      try {
        const data = await getVentasPorPeriodo(activeTimeframe)
        setVentas(data)
      } catch (error) {
        console.error('Error cargando ventas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadVentas()
  }, [activeTimeframe])

  // Generar datos para el gráfico (similar al ejemplo)
  const generateChartPath = () => {
    const valores = Object.values(ventas.ventasPorDia)
    
    if (valores.length === 0) {
      // Datos por defecto si no hay datos (línea plana)
      return 'M 0 109 L 68 109 L 136 109 L 204 109 L 272 109 L 340 109 L 408 109'
    }

    const maxValue = Math.max(...valores, 1)
    const puntos = valores.length || 7
    const ancho = 478
    const alto = 150
    const padding = 1

    const path = valores.map((valor, index) => {
      const x = (index / (puntos - 1)) * (ancho - padding * 2) + padding
      const y = alto - (valor / maxValue) * (alto - padding * 2) - padding
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    return path
  }

  const formatCurrency = (value: number) => {
    return `Bs. ${value.toFixed(2)}`
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerTop}>
            <h2 className={styles.title}>Resumen de Ventas</h2>
            <div className={styles.controls}>
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  className={`${styles.button} ${activeTimeframe === timeframe ? styles.active : ''}`}
                  onClick={() => setActiveTimeframe(timeframe)}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.valueContainer}>
            <div className={styles.value}>
              {loading ? 'Cargando...' : formatCurrency(ventas.total)}
            </div>
            <div className={styles.change}>
              {loading ? '' : `${ventas.cambio >= 0 ? '+' : ''}${ventas.cambio.toFixed(1)}% ${activeTimeframe === 'Hoy' ? 'hoy' : activeTimeframe === 'Semana' ? 'esta semana' : 'este mes'}`}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <div className={styles.chartArea}>
          <svg viewBox="0 0 478 150" preserveAspectRatio="none" className={styles.svg} style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${generateChartPath()} L 478 150 L 0 150 Z`}
              fill="url(#gradient)"
            />
            <path
              d={generateChartPath()}
              fill="none"
              stroke="#137fec"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className={styles.labels}>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCategorias } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import { showSuccess, showError } from '@/lib/swal'
import styles from './categorias.module.css'

interface Category {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  orden: number
  estado: 'Activo' | 'Inactivo'
}

const getIconName = (icono: string | null) => {
  switch (icono) {
    case 'coffee':
      return 'coffee'
    case 'cake':
      return 'cake'
    case 'snowflake':
      return 'ac_unit'
    default:
      return 'coffee'
  }
}

const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'Activo':
      return styles.statusActivo
    case 'Inactivo':
      return styles.statusInactivo
    default:
      return styles.statusInactivo
  }
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    orden: 1,
    activa: false
  })

  // Cargar categorías de Supabase
  useEffect(() => {
    async function loadCategorias() {
      try {
        const data = await getCategorias()
        setCategories(data || [])
      } catch (error: any) {
        console.error('Error cargando categorías:', error)
        console.error('Detalles del error:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        })
        // Si es un error de RLS o tabla no existe, mostrar mensaje útil
        if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
          console.error('⚠️ La tabla "categorias" no existe en Supabase. Ejecuta el archivo supabase_schema.sql primero.')
        } else if (error?.code === '42501' || error?.message?.includes('permission denied')) {
          console.error('⚠️ Error de permisos. Verifica las políticas RLS en Supabase.')
        }
      } finally {
        setLoading(false)
      }
    }
    loadCategorias()
  }, [])

  const iconOptions = [
    { value: 'coffee', label: 'Café' },
    { value: 'cake', label: 'Pastel' },
    { value: 'snowflake', label: 'Copo de Nieve' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          icono: formData.icono || null,
          orden: formData.orden,
          estado: formData.activa ? 'Activo' : 'Inactivo'
        })
        .select()
        .single()

      if (error) throw error

      // Recargar categorías
      const nuevasCategorias = await getCategorias()
      setCategories(nuevasCategorias || [])

      setIsModalOpen(false)
      setFormData({
        nombre: '',
        descripcion: '',
        icono: '',
        orden: 1,
        activa: false
      })
      await showSuccess('Categoría creada', 'La categoría ha sido creada exitosamente')
    } catch (error: any) {
      console.error('Error creando categoría:', error)
      await showError('Error al crear categoría', error?.message || 'Error desconocido al crear la categoría')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setFormData({
      nombre: '',
      descripcion: '',
      icono: '',
      orden: 1,
      activa: false
    })
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbLink}>Dashboard</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/productos" className={styles.breadcrumbLink}>Productos</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Categorías</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Administración de Categorías</h1>
          <p className={styles.description}>
            Gestiona las categorías de tus productos.
          </p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          <span className="truncate">Agregar Categoría</span>
        </button>
      </div>

      {/* Tabla de Categorías */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Icono</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    Cargando categorías...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No hay categorías. Crea una nueva categoría.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className={styles.iconContainer}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          {getIconName(category.icono)}
                        </span>
                      </div>
                    </td>
                    <td className={styles.categoryName}>{category.nombre}</td>
                    <td className={styles.categoryDescription}>{category.descripcion || '-'}</td>
                    <td className={styles.order}>{category.orden}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(category.estado)}`}>
                        {category.estado}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} aria-label="Editar" title="Editar">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className={`${styles.actionButton} ${styles.delete}`} aria-label="Eliminar" title="Eliminar">
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
      </div>

      {/* Modal Crear Nueva Categoría */}
      {isModalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={handleClose} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Crear Nueva Categoría</h2>
              <button className={styles.modalClose} onClick={handleClose}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <p className={styles.modalSubtitle}>
              Rellena los detalles de la nueva categoría.
            </p>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre de la categoría <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Bebidas Calientes"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Añade una descripción opcional..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Icono</label>
                <select
                  className={styles.select}
                  value={formData.icono}
                  onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                >
                  <option value="">Seleccionar icono</option>
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Orden de visualización</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  />
                  <span>Categoría activa</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.createButton}
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}


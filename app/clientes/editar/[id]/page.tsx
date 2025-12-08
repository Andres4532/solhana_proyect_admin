'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { actualizarCliente, getClientes } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import { showSuccess, showError } from '@/lib/swal'
import styles from './editar.module.css'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form data
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tipo, setTipo] = useState<'Nuevo' | 'Recurrente' | 'VIP'>('Nuevo')

  // Cargar cliente
  useEffect(() => {
    async function loadCliente() {
      try {
        const clientes = await getClientes({})
        const cliente = clientes?.find(c => c.id === id)
        
        if (cliente) {
          setNombre(cliente.nombre || '')
          setApellido(cliente.apellido || '')
          setEmail(cliente.email || '')
          setTelefono(cliente.telefono || '')
          setWhatsapp(cliente.whatsapp || '')
          setTipo(cliente.tipo || 'Nuevo')
        } else {
          await showError('Cliente no encontrado', 'No se pudo encontrar el cliente')
          router.push('/clientes')
        }
      } catch (error) {
        console.error('Error cargando cliente:', error)
        await showError('Error al cargar', 'No se pudo cargar el cliente')
        router.push('/clientes')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadCliente()
    }
  }, [id, router])

  // Función para guardar cambios
  const handleSave = async () => {
    if (!nombre) {
      await showError('Campo requerido', 'El nombre es obligatorio')
      return
    }

    setSaving(true)
    try {
      await actualizarCliente(id, {
        nombre,
        apellido: apellido || undefined,
        email: email || undefined,
        telefono: telefono || undefined,
        whatsapp: whatsapp || undefined,
        tipo
      })

      await showSuccess('Cliente actualizado', 'El cliente ha sido actualizado exitosamente')
      router.push('/clientes')
    } catch (error: any) {
      console.error('Error actualizando cliente:', error)
      await showError('Error al actualizar', error?.message || 'Error desconocido al actualizar el cliente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Cargando cliente...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/clientes" className={styles.backLink}>← Volver a Clientes</Link>
          <h1 className={styles.title}>Editar Cliente</h1>
        </div>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Nombre <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Apellido</label>
          <input
            type="text"
            className={styles.input}
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Teléfono</label>
          <input
            type="text"
            className={styles.input}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>WhatsApp</label>
          <input
            type="text"
            className={styles.input}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tipo de Cliente</label>
          <select 
            className={styles.select}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'Nuevo' | 'Recurrente' | 'VIP')}
          >
            <option value="Nuevo">Nuevo</option>
            <option value="Recurrente">Recurrente</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>
    </div>
  )
}


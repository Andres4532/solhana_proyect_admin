import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztbiqgfypxgptvconxon.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

if (!supabaseAnonKey) {
  console.error('❌ ERROR: Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  console.error('📝 Crea el archivo .env.local en la raíz del proyecto con:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://ztbiqgfypxgptvconxon.supabase.co')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui')
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript (opcional pero recomendado)
export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          icono: string | null
          orden: number
          estado: 'Activo' | 'Inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          icono?: string | null
          orden?: number
          estado?: 'Activo' | 'Inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          icono?: string | null
          orden?: number
          estado?: 'Activo' | 'Inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          sku: string
          nombre: string
          descripcion: string | null
          descripcion_corta: string | null
          precio: number
          descuento: number
          precio_original: number | null
          stock: number
          categoria_id: string | null
          tipo_producto: string | null
          estado: 'Borrador' | 'Activo' | 'Inactivo'
          tiene_variantes: boolean
          es_nuevo: boolean
          es_best_seller: boolean
          es_oferta: boolean
          etiqueta_personalizada: string | null
          tiempo_envio: string | null
          calificacion_promedio: number
          total_resenas: number
          created_at: string
          updated_at: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          apellido: string | null
          email: string | null
          telefono: string | null
          whatsapp: string | null
          tipo: 'Nuevo' | 'Recurrente' | 'VIP'
          fecha_registro: string
          total_pedidos: number
          total_gastado: number
          user_id: string | null
          created_at: string
          updated_at: string
        }
      }
      pedidos: {
        Row: {
          id: string
          numero_pedido: string
          cliente_id: string | null
          nombre_cliente: string | null
          apellido_cliente: string | null
          telefono_cliente: string | null
          email_cliente: string | null
          estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado'
          subtotal: number
          descuento: number
          costo_envio: number
          envio_prioritario: boolean
          total: number
          metodo_pago: string | null
          metodo_envio: string | null
          direccion_completa: string | null
          ciudad_envio: string | null
          referencias_envio: string | null
          whatsapp_enviado: boolean
          fecha_pedido: string
          fecha_entrega: string | null
          created_at: string
          updated_at: string
        }
      }
      carrito: {
        Row: {
          id: string
          cliente_id: string | null
          session_id: string | null
          producto_id: string
          variante_id: string | null
          cantidad: number
          precio_unitario: number
          color: string | null
          talla: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      productos_catalogo: {
        Row: {
          id: string
          sku: string
          nombre: string
          descripcion_corta: string | null
          precio: number
          descuento: number
          precio_original: number | null
          precio_final: number
          stock: number
          categoria_id: string | null
          categoria_nombre: string | null
          tipo_producto: string | null
          es_nuevo: boolean
          es_best_seller: boolean
          es_oferta: boolean
          etiqueta_personalizada: string | null
          tiempo_envio: string | null
          calificacion_promedio: number
          total_resenas: number
          imagen_principal: string | null
          estado_stock: string
          estado: 'Borrador' | 'Activo' | 'Inactivo'
          created_at: string
        }
      }
      carrito_completo: {
        Row: {
          id: string
          cliente_id: string | null
          session_id: string | null
          producto_id: string
          variante_id: string | null
          producto_nombre: string
          producto_sku: string
          variante_atributos: any | null
          cantidad: number
          precio_unitario: number
          subtotal: number
          imagen: string | null
          color: string | null
          talla: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}


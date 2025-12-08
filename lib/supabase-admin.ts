import { createClient } from '@supabase/supabase-js'

// Cliente para operaciones del admin (usar service_role key)
// ⚠️ IMPORTANTE: Este archivo solo debe usarse en el servidor (API routes, Server Components)
// NUNCA exponer el service_role key al cliente

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

// Cliente con service_role para operaciones administrativas
// Solo usar en Server Components o API Routes
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Función helper para verificar si estamos en el servidor
export function isServer() {
  return typeof window === 'undefined'
}



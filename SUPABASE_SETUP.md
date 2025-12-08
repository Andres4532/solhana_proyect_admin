# 🔌 Configuración de Supabase

## Paso 1: Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings** (⚙️) > **API**
3. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - Ya lo tienes: `https://ztbiqgfypxgptvconxon.supabase.co`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Es la key que empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - Está en la sección "API Keys" > "anon public"
     - ⚠️ NO uses la "service_role" key aquí (esa es solo para servidor)

## Paso 2: Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Ejemplo con tu proyecto:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ztbiqgfypxgptvconxon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmlxZ2Z5cHhncHR2Y29ueG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mz...tu-key-completa
```

**⚠️ IMPORTANTE:**
- Usa la key **"anon public"** (NO la "service_role")
- La key completa es muy larga, cópiala completa
- No dejes espacios al inicio o final

## Paso 3: Reiniciar el servidor

Después de crear el archivo `.env.local`, reinicia el servidor de desarrollo:

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

## ✅ Verificación

Para verificar que la conexión funciona, puedes crear una página de prueba o usar las funciones en `lib/supabase-queries.ts`.

## 📚 Uso

### Ejemplo básico en un componente:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { getProductosCatalogo } from '@/lib/supabase-queries'

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProductos() {
      try {
        const data = await getProductosCatalogo({ limit: 10 })
        setProductos(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      {productos.map(producto => (
        <div key={producto.id}>{producto.nombre}</div>
      ))}
    </div>
  )
}
```

### Funciones disponibles en `lib/supabase-queries.ts`:

- `getProductos()` - Obtener todos los productos
- `getProductoById(id)` - Obtener un producto por ID
- `getProductosCatalogo(filters)` - Obtener productos con filtros
- `getCategorias()` - Obtener todas las categorías
- `getCarrito(clienteId, sessionId)` - Obtener carrito
- `agregarAlCarrito(item)` - Agregar producto al carrito
- `crearPedido(pedido)` - Crear un nuevo pedido
- `getClientes(filters)` - Obtener clientes con filtros
- Y muchas más...

## 🔒 Seguridad

- Las variables `NEXT_PUBLIC_*` son públicas y se exponen al cliente
- Para operaciones sensibles del admin, considera usar el `service_role` key en el servidor
- Las políticas RLS en Supabase protegen los datos según las reglas definidas


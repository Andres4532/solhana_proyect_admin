# 🔑 Cómo Obtener tu Supabase URL y Key

## 📍 Ubicación Exacta en Supabase

### Paso 1: Ve a tu proyecto en Supabase

1. Abre [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (el que tiene la URL `ztbiqgfypxgptvconxon`)

### Paso 2: Navega a Settings > API

1. En el **menú lateral izquierdo**, busca el ícono de **⚙️ Settings** (Configuración)
2. Haz clic en **Settings**
3. En el submenú que aparece, haz clic en **API**

### Paso 3: Encuentra la información

En la página de **API Settings** verás varias secciones:

#### 📋 Sección 1: "Project URL" o "Project Configuration"

Aquí encontrarás:
- **Project URL**: `https://ztbiqgfypxgptvconxon.supabase.co`
  - Esta es tu `NEXT_PUBLIC_SUPABASE_URL`
  - Está en la parte superior de la página
  - Puede estar en una caja con el label "Project URL" o "API URL"

#### 🔑 Sección 2: "API Keys" o "Project API keys"

Aquí encontrarás las keys:

##### **anon public** key (La que necesitas para el cliente)
- **Label**: "anon" o "anon public" o "public anon key"
- **Ubicación**: Primera key en la lista (generalmente)
- **Características**:
  - Empieza con: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Es SEGURA para usar en el cliente (navegador)
  - Tiene un botón de "Reveal" o "Show" para verla completa
- **Esta es la que usas para**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

##### **service_role** key (NO la uses en el cliente - Solo servidor)
- **Label**: "service_role" o "service_role key"
- **Ubicación**: Segunda key en la lista
- **Características**:
  - ⚠️ NUNCA la expongas al cliente
  - Solo úsala en API routes o Server Components
  - Tiene permisos completos, bypassa RLS

## Paso 3: Configurar en tu proyecto

Crea o edita el archivo `.env.local` en la raíz de tu proyecto:

```env
# Tu Project URL (ya lo tienes)
NEXT_PUBLIC_SUPABASE_URL=https://ztbiqgfypxgptvconxon.supabase.co

# Tu anon public key (cópiala de Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmlxZ2Z5cHhncHR2Y29ueG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mz...tu-key-completa-aqui

# Opcional: service_role key (solo para operaciones del admin en servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmlxZ2Z5cHhncHR2Y29ueG9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcz...tu-service-key-completa-aqui
```

## ⚠️ Importante

1. **NUNCA** subas el archivo `.env.local` a Git (ya está en .gitignore)
2. **NUNCA** expongas la `service_role` key al cliente
3. La `anon` key es segura para usar en el navegador
4. Después de crear/editar `.env.local`, **reinicia el servidor** (`npm run dev`)

## ✅ Verificación

Para verificar que funciona, puedes probar en la consola del navegador (después de cargar una página):

```javascript
// Esto debería funcionar si la key está correcta
import { supabase } from '@/lib/supabase'
const { data } = await supabase.from('categorias').select('*').limit(1)
console.log(data)
```

## 📍 Estructura Visual de la Página

Cuando estés en **Settings > API**, verás algo así:

```
┌─────────────────────────────────────────────────┐
│  API Settings                                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  📋 Project Configuration                        │
│  ┌───────────────────────────────────────────┐  │
│  │ Project URL                                │  │
│  │ https://ztbiqgfypxgptvconxon.supabase.co  │  │
│  │ [Copy]                                     │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  🔑 Project API keys                             │
│  ┌───────────────────────────────────────────┐  │
│  │ anon public                                │  │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │  │
│  │ [Reveal] [Copy]                            │  │
│  │ ← ESTA ES LA QUE NECESITAS                 │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ service_role                               │  │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │  │
│  │ [Reveal] [Copy]                            │  │
│  │ ⚠️ NO uses esta en el cliente              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 🗺️ Ruta Completa en Supabase

```
Dashboard de Supabase
  └── Tu Proyecto (ztbiqgfypxgptvconxon)
      └── Menú Lateral Izquierdo
          └── ⚙️ Settings
              └── API (en el submenú)
                  ├── 📋 Project URL: https://ztbiqgfypxgptvconxon.supabase.co
                  └── 🔑 API Keys
                      ├── anon public: eyJhbGci... ← ESTA
                      └── service_role: eyJhbGci... (NO esta)
```


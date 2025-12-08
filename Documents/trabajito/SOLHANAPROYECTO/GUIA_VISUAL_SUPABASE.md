# 🗺️ Guía Visual: Dónde Encontrar URL y Key en Supabase

## 📍 Paso a Paso con Imágenes Mentales

### 1️⃣ Inicia Sesión en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **Sign In** (si no estás logueado)
3. Ingresa tus credenciales

### 2️⃣ Selecciona tu Proyecto

1. En el dashboard verás una lista de proyectos
2. Busca el proyecto con la URL que contiene: `ztbiqgfypxgptvconxon`
3. Haz clic en el proyecto para abrirlo

### 3️⃣ Ve a Settings

En el **menú lateral izquierdo** verás varios íconos:

```
🏠 Home
📊 Database
🔐 Authentication
📦 Storage
🔧 Edge Functions
⚙️ Settings  ← HAZ CLIC AQUÍ
📚 Documentation
```

Haz clic en **⚙️ Settings**

### 4️⃣ Selecciona API

Después de hacer clic en Settings, verás un **submenú**:

```
Settings
  ├── General
  ├── API          ← HAZ CLIC AQUÍ
  ├── Database
  ├── Auth
  ├── Storage
  └── ...
```

Haz clic en **API**

### 5️⃣ Encuentra la Información

Ahora estás en la página de **API Settings**. Verás:

#### 🔵 Project URL (Arriba de la página)

```
┌─────────────────────────────────────────────┐
│ Project URL                                  │
│                                              │
│ https://ztbiqgfypxgptvconxon.supabase.co    │
│                                              │
│ [📋 Copy]                                    │
└─────────────────────────────────────────────┘
```

**Esta es tu `NEXT_PUBLIC_SUPABASE_URL`**

#### 🟢 anon public key (En la sección "Project API keys")

```
┌─────────────────────────────────────────────┐
│ Project API keys                             │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ anon public                              │ │
│ │                                          │ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ │
│ │ (key muy larga, puede estar oculta)     │ │
│ │                                          │ │
│ │ [👁️ Reveal]  [📋 Copy]                  │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ service_role                             │ │
│ │ (NO uses esta)                           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Esta es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`**

### 6️⃣ Copia los Valores

1. **Para la URL**: Haz clic en el botón **Copy** al lado de "Project URL"
2. **Para la Key**: 
   - Si está oculta, haz clic en **Reveal** o **Show**
   - Luego haz clic en **Copy** para copiarla completa

## ✅ Configura tu `.env.local`

Crea el archivo `.env.local` en la raíz de tu proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ztbiqgfypxgptvconxon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmlxZ2Z5cHhncHR2Y29ueG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mz...resto-de-la-key-completa
```

## 🎯 Resumen Rápido

| Variable | Dónde está | Qué copiar |
|----------|------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > **Project URL** | `https://ztbiqgfypxgptvconxon.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings > API > **API Keys** > **anon public** | La key completa que empieza con `eyJhbGci...` |

## ⚠️ Importante

- ✅ Usa la key **"anon public"** (NO "service_role")
- ✅ Copia la key **completa** (es muy larga)
- ✅ No dejes espacios al inicio o final
- ✅ Reinicia el servidor después de crear `.env.local`

## 🆘 Si No Encuentras la Página

1. Asegúrate de estar en el proyecto correcto
2. Verifica que estés en: **Settings** > **API** (no en otro submenú)
3. Si no ves "API" en el submenú, busca "Project Settings" o "Configuration"



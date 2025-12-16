# 🔧 Solución: Error "The name contains invalid characters"

## ⚠️ Problema

Vercel está rechazando el nombre del proyecto porque contiene guiones (-) u otros caracteres no permitidos.

## ✅ Solución Paso a Paso

### Paso 1: Identifica el Campo Correcto

En la pantalla de configuración de Vercel, busca el campo **"Project Name"** (NO el nombre del repositorio de GitHub).

- ❌ **NO es:** El nombre del repositorio de GitHub (`solhana-proyect-client`)
- ✅ **SÍ es:** El campo "Project Name" en la configuración de Vercel

### Paso 2: Cambia el Nombre del Proyecto

1. **En la pantalla de configuración de Vercel**, busca la sección que dice:
   ```
   Project Name
   solhana-proyect-client  ← Este es el que debes cambiar
   ```

2. **Borra el nombre actual** y escribe uno nuevo **SIN guiones**:
   ```
   solhana_proyect_client  ← Usa guiones bajos (_) en lugar de guiones (-)
   ```

   **Opciones válidas:**
   - `solhana_proyect_client` ✅
   - `solhanaproyectclient` ✅
   - `solhanaProyectClient` ✅ (aunque mejor usar guiones bajos)

### Paso 3: Verifica que NO Haya Otros Campos con Problemas

Asegúrate de que **SOLO** el "Project Name" tenga el problema. Los otros campos deben estar así:

- **Framework Preset:** Next.js ✅
- **Root Directory:** `./` ✅
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

### Paso 4: Configura las Variables de Entorno

En la sección "Environment Variables", agrega:

1. **Primera variable:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://ztbiqgfypxgptvconxon.supabase.co`

2. **Segunda variable:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmlxZ2Z5cHhncHR2Y29ueG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTYzODQsImV4cCI6MjA3NTUzMjM4NH0.ySE8B_cTPyfKuBrjPqBzfoa3J1uMAVzze0uoe_Cwz7I`

### Paso 5: Haz Clic en "Deploy"

Una vez que hayas cambiado el nombre del proyecto a uno válido (sin guiones), haz clic en el botón "Deploy".

---

## 🎯 Reglas para el Nombre del Proyecto

| ✅ Permitido | ❌ NO Permitido |
|-------------|----------------|
| Letras (a-z, A-Z) | Guiones (-) |
| Números (0-9) | Espacios |
| Guiones bajos (_) | Puntos (.) |
| | No puede empezar con número |

### Ejemplos:

**✅ Nombres VÁLIDOS:**
- `solhana_proyect_client`
- `solhanaproyectclient`
- `mi_tienda_online`
- `proyecto123`

**❌ Nombres INVÁLIDOS:**
- `solhana-proyect-client` (tiene guiones)
- `123proyecto` (empieza con número)
- `mi proyecto` (tiene espacio)
- `proyecto.tienda` (tiene punto)

---

## 🆘 Si Aún Tienes el Error

### Opción 1: Usar un Nombre Más Simple

Intenta con un nombre más corto y simple:
```
solhanaproyecto
```

### Opción 2: Verificar que No Haya Espacios Ocultos

1. Selecciona todo el texto del campo "Project Name"
2. Bórralo completamente
3. Escribe el nuevo nombre desde cero: `solhana_proyect_client`

### Opción 3: Crear el Proyecto sin Nombre Personalizado

1. Deja que Vercel genere el nombre automáticamente
2. O usa el nombre del repositorio pero reemplazando guiones con guiones bajos

---

## 📸 Ubicación Exacta del Campo

El campo "Project Name" está ubicado en:

```
┌─────────────────────────────────────┐
│ Vercel Team                         │
│ andres4532's projects              │
│ Hobby                               │
│                                     │
│ Slash Divider                       │
│                                     │
│ Project Name  ← AQUÍ                │
│ [solhana-proyect-client]  ← Cambia esto
│                                     │
│ Framework Preset                    │
│ Next.js                             │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Final

Antes de hacer clic en "Deploy", verifica:

- [ ] El "Project Name" NO tiene guiones (-)
- [ ] El "Project Name" solo tiene letras, números y guiones bajos (_)
- [ ] El "Project Name" NO empieza con un número
- [ ] Las variables de entorno están configuradas correctamente
- [ ] El Framework Preset es "Next.js"

---

¡Con estos pasos deberías poder desplegar sin problemas! 🚀


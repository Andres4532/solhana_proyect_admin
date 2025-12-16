# ⚡ Deploy Rápido en Vercel - Guía Express

## 🎯 Método Recomendado: Desde la Web (Más Fácil)

### Paso 1: Subir Código a GitHub

1. **Inicializa Git (si no lo has hecho):**
   ```bash
   git init
   git add .
   git commit -m "Preparar para deploy"
   ```

2. **Crea un repositorio en GitHub:**
   - Ve a [github.com/new](https://github.com/new)
   - Crea un nuevo repositorio
   - **NO** inicialices con README, .gitignore o licencia

3. **Conecta y sube tu código:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Desplegar en Vercel

1. **Ve a [vercel.com/new](https://vercel.com/new)**
2. **Inicia sesión** (puedes usar tu cuenta de GitHub)
3. **Importa tu repositorio:**
   - Haz clic en "Import Git Repository"
   - Selecciona tu repositorio
   - Haz clic en "Import"

4. **Configura el proyecto:**
   - **Framework:** Next.js (se detecta automáticamente)
   - **Root Directory:** `./` (dejar por defecto)
   - **Project Name:** ⚠️ Solo letras, números y guiones bajos (_)
     - ✅ Ejemplo válido: `solhana_proyect_client`
     - ❌ NO uses: `solhana-proyect-client` (guión no permitido)
   - Haz clic en "Environment Variables"

5. **Agrega las variables de entorno:**
   
   | Variable | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ztbiqgfypxgptvconxon.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
   
   **Cómo obtener la anon key:**
   - Ve a [Supabase Dashboard](https://supabase.com/dashboard)
   - Settings > API
   - Copia la key **"anon public"** (NO "service_role")

6. **Haz clic en "Deploy"**

### Paso 3: ¡Listo! 🎉

- Tu proyecto estará en: `https://tu-proyecto.vercel.app`
- Cada `git push` desplegará automáticamente

---

## 🛠️ Método Alternativo: Desde CLI (Terminal)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Login
```bash
vercel login
```

### Paso 3: Deploy
```bash
vercel
```

Sigue las instrucciones:
- **Set up and deploy?** → Enter (Yes)
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → No (primera vez)
- **What's your project's name?** → Enter (usa el nombre por defecto)
- **In which directory is your code located?** → Enter (./)

### Paso 4: Configurar Variables de Entorno

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. **Settings** > **Environment Variables**
4. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ztbiqgfypxgptvconxon.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Tu anon key

### Paso 5: Deploy a Producción
```bash
vercel --prod
```

O desde el dashboard, haz clic en "Redeploy"

---

## 🔗 Compartir tu Proyecto

Una vez desplegado, puedes compartir:
- **URL de Producción:** `https://tu-proyecto.vercel.app`
- **Repositorio GitHub:** `https://github.com/tu-usuario/tu-repo`

---

## ✅ Checklist Antes de Compartir

- [ ] El proyecto se construye sin errores (`npm run build`)
- [ ] Las variables de entorno están configuradas en Vercel
- [ ] El proyecto funciona en la URL de Vercel
- [ ] No hay errores en la consola del navegador
- [ ] La conexión con Supabase funciona

---

## ⚠️ Recordatorios Importantes

1. **NO subas `.env.local` a GitHub** (ya está en `.gitignore`)
2. **Configura las variables de entorno en Vercel** (no solo localmente)
3. **Prueba localmente primero:** `npm run build`
4. **Usa la key "anon public"** de Supabase (NO "service_role")

---

## 🆘 ¿Problemas?

1. **Error de build:** Revisa los logs en Vercel
2. **Variables faltantes:** Verifica en Settings > Environment Variables
3. **Error de conexión:** Verifica que las keys de Supabase sean correctas

**Para más detalles, revisa:** `GUIA_VERCEL.md`

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía Completa de Vercel](./GUIA_VERCEL.md)


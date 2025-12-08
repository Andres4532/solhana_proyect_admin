# Configuración de Buckets en Supabase Storage

## 📦 Buckets Necesarios

El proyecto requiere los siguientes buckets en Supabase Storage:

1. **`productos`** - Para imágenes de productos
2. **`categorias`** - Para imágenes de categorías
3. **`banners`** - Para banners del diseño de página (opcional)

## 🚀 Pasos para Crear los Buckets

### Paso 1: Acceder a Supabase Storage

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**
3. Verás una lista de buckets existentes

### Paso 2: Crear el Bucket `categorias`

1. Haz clic en el botón **"New bucket"** o **"Crear bucket"**
2. Configura el bucket:
   - **Name**: `categorias` (exactamente así, en minúsculas)
   - **Public bucket**: ✅ **MARCAR ESTA OPCIÓN** (importante para que las imágenes sean públicas)
   - **File size limit**: 5 MB (o el tamaño que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
3. Haz clic en **"Create bucket"**

### Paso 3: Crear el Bucket `productos` (si no existe)

1. Si no existe el bucket `productos`, créalo de la misma manera:
   - **Name**: `productos`
   - **Public bucket**: ✅ **MARCAR**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### Paso 4: Configurar Políticas de Seguridad (RLS)

Para que las imágenes sean accesibles públicamente, necesitas configurar las políticas:

1. Ve a **Storage** → **Policies**
2. Para cada bucket (`categorias` y `productos`), crea las siguientes políticas:

#### Política 1: Permitir lectura pública (SELECT)
- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  true
  ```
- **Target roles**: `anon`, `authenticated`

#### Política 2: Permitir inserción (INSERT)
- **Policy name**: `Allow Insert`
- **Allowed operation**: `INSERT`
- **Policy definition**: 
  ```sql
  true
  ```
- **Target roles**: `authenticated` (o `anon` si quieres que cualquiera pueda subir)

#### Política 3: Permitir actualización (UPDATE)
- **Policy name**: `Allow Update`
- **Allowed operation**: `UPDATE`
- **Policy definition**: 
  ```sql
  true
  ```
- **Target roles**: `authenticated`

#### Política 4: Permitir eliminación (DELETE)
- **Policy name**: `Allow Delete`
- **Allowed operation**: `DELETE`
- **Policy definition**: 
  ```sql
  true
  ```
- **Target roles**: `authenticated`

### Paso 5: Verificar la Configuración

1. Después de crear los buckets, verifica que aparezcan en la lista de Storage
2. Asegúrate de que el ícono de "público" esté visible junto al nombre del bucket
3. Prueba subiendo una imagen de prueba desde el panel de administración

## ⚠️ Notas Importantes

- **Buckets públicos**: Si marcas el bucket como público, las imágenes serán accesibles sin autenticación. Esto es necesario para que las imágenes se muestren en el frontend público.
- **Nombres exactos**: Los nombres de los buckets deben coincidir exactamente con los usados en el código (`categorias`, `productos`).
- **Políticas RLS**: Si no configuras las políticas correctamente, puede que no puedas subir o acceder a las imágenes.

## 🔧 Solución Rápida (SQL)

Si prefieres usar SQL, puedes ejecutar esto en el SQL Editor de Supabase:

```sql
-- Crear bucket de categorías (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'categorias',
  'categorias',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket de productos (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productos',
  'productos',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket de categorías
CREATE POLICY "Public Access categorias"
ON storage.objects FOR SELECT
USING (bucket_id = 'categorias');

CREATE POLICY "Allow Insert categorias"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'categorias');

CREATE POLICY "Allow Update categorias"
ON storage.objects FOR UPDATE
USING (bucket_id = 'categorias');

CREATE POLICY "Allow Delete categorias"
ON storage.objects FOR DELETE
USING (bucket_id = 'categorias');

-- Políticas para bucket de productos
CREATE POLICY "Public Access productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

CREATE POLICY "Allow Insert productos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'productos');

CREATE POLICY "Allow Update productos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'productos');

CREATE POLICY "Allow Delete productos"
ON storage.objects FOR DELETE
USING (bucket_id = 'productos');
```

## ✅ Verificación

Después de configurar, prueba subiendo una imagen desde:
- El editor de diseño de página (categorías)
- El formulario de productos

Si todo está bien configurado, las imágenes se subirán correctamente y se mostrarán en el preview.


# SOLHANA - Documentación de Base de Datos

## 📋 Descripción

Este esquema de base de datos está diseñado para soportar todas las funcionalidades del panel de administración SOLHANA, incluyendo:

- Gestión de productos y categorías
- Sistema de pedidos completo
- Gestión de clientes
- Reportes y analíticas
- Diseño de página de inicio

## 🚀 Instalación en Supabase

### Paso 1: Crear un nuevo proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota las credenciales de conexión

### Paso 2: Ejecutar el esquema SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase_schema.sql`
3. Ejecuta el script completo

### Paso 3: Configurar autenticación (opcional)

Si quieres usar autenticación de Supabase, ajusta las políticas RLS según tus necesidades.

## 📊 Estructura de Tablas

### Tablas Principales

#### `categorias`
Almacena las categorías de productos.
- **Campos clave**: nombre, descripción, icono, orden, estado

#### `productos`
Productos principales del inventario.
- **Campos clave**: sku, nombre, precio, stock, categoria_id, estado
- **Campos nuevos para cliente**: descripcion_corta, precio_original, tipo_producto, es_nuevo, es_best_seller, es_oferta, etiqueta_personalizada, tiempo_envio, calificacion_promedio, total_resenas
- **Relaciones**: categorias (muchos a uno)

#### `producto_variantes`
Variantes de productos (colores, tallas, etc.).
- **Campos clave**: producto_id, atributos (JSONB), precio, stock
- **Relaciones**: productos (muchos a uno)

#### `producto_imagenes`
Imágenes asociadas a productos.
- **Campos clave**: producto_id, url, es_principal
- **Relaciones**: productos (muchos a uno)

#### `clientes`
Información de clientes.
- **Campos clave**: nombre, email, telefono, tipo (Nuevo/Recurrente/VIP)
- **Campos calculados**: total_pedidos, total_gastado (actualizados automáticamente)

#### `pedidos`
Pedidos realizados por clientes.
- **Campos clave**: numero_pedido, cliente_id, estado, total
- **Relaciones**: clientes (muchos a uno), cliente_direcciones (envío y facturación)

#### `pedido_items`
Items individuales de cada pedido.
- **Campos clave**: pedido_id, producto_id, cantidad, precio_unitario
- **Relaciones**: pedidos (muchos a uno), productos (muchos a uno)

#### `pedido_historial`
Historial de cambios de estado de pedidos.
- **Campos clave**: pedido_id, estado, descripcion, fecha
- **Relaciones**: pedidos (muchos a uno)

#### `diseno_pagina`
Configuración del diseño de la página de inicio.
- **Campos clave**: seccion, configuracion (JSONB), visible, orden

### Tablas para Funcionalidades del Cliente

#### `carrito`
Carrito de compras (soporta usuarios anónimos y autenticados).
- **Campos clave**: cliente_id, session_id, producto_id, variante_id, cantidad, precio_unitario
- **Relaciones**: clientes (opcional), productos, producto_variantes

#### `producto_resenas`
Reseñas y calificaciones de productos.
- **Campos clave**: producto_id, cliente_id, calificacion (1-5), comentario, estado
- **Relaciones**: productos, clientes (opcional)

#### `wishlist`
Lista de deseos/favoritos.
- **Campos clave**: cliente_id, session_id, producto_id
- **Relaciones**: clientes (opcional), productos

#### `newsletter_suscripciones`
Suscripciones al newsletter.
- **Campos clave**: email, nombre, activo, confirmado

#### `metodos_pago`
Métodos de pago disponibles.
- **Campos clave**: nombre, codigo, descripcion, activo

#### `metodos_envio`
Métodos de envío disponibles.
- **Campos clave**: nombre, codigo, costo, costo_gratis_desde, tiempo_estimado

#### `ciudades_envio`
Ciudades disponibles para envío.
- **Campos clave**: nombre, codigo_postal, pais, costo_envio_adicional

#### `productos_relacionados`
Productos relacionados/recomendados.
- **Campos clave**: producto_id, producto_relacionado_id, tipo

#### `busquedas`
Registro de búsquedas realizadas (para analytics).
- **Campos clave**: termino_busqueda, session_id, resultados_encontrados

#### `sesiones_usuario`
Sesiones de usuarios anónimos para carrito.
- **Campos clave**: session_id, ip_address, expires_at

## 🔄 Funcionalidades Automáticas

### 1. Generación Automática de Número de Pedido
Los números de pedido se generan automáticamente en formato `#00001`, `#00002`, etc.

### 2. Actualización de Estadísticas de Cliente
Cuando se crea o actualiza un pedido, se actualizan automáticamente:
- Total de pedidos del cliente
- Total gastado
- Tipo de cliente (Nuevo/Recurrente/VIP) basado en:
  - **VIP**: 10+ pedidos Y $500+ gastados
  - **Recurrente**: 3+ pedidos
  - **Nuevo**: Menos de 3 pedidos

### 3. Historial Automático de Pedidos
Cada vez que cambia el estado de un pedido, se crea automáticamente un registro en `pedido_historial`.

### 4. Actualización de Timestamps
Todas las tablas con campo `updated_at` se actualizan automáticamente al modificar registros.

### 5. Actualización de Calificación de Productos
Cuando se aprueba una reseña, se actualiza automáticamente la calificación promedio y el total de reseñas del producto.

### 6. Limpieza de Sesiones Expiradas
Función disponible para limpiar sesiones y carritos expirados.

## 📈 Vistas Disponibles

### `productos_completos`
Vista que incluye información completa de productos con categoría y estado de stock.

### `pedidos_completos`
Vista que incluye información del cliente junto con los datos del pedido.

### `productos_mas_vendidos`
Vista que muestra los productos más vendidos con estadísticas de ventas.

### `productos_catalogo`
Vista optimizada para el catálogo público con información completa de productos activos, incluyendo precios calculados, imágenes y estados.

### `carrito_completo`
Vista del carrito con información completa de productos, variantes e imágenes.

## 🔍 Consultas Útiles

### Obtener productos con bajo stock
```sql
SELECT * FROM productos_completos 
WHERE estado_stock = 'Bajo Stock' OR estado_stock = 'Sin Stock';
```

### Obtener pedidos pendientes
```sql
SELECT * FROM pedidos_completos 
WHERE estado = 'Pendiente' 
ORDER BY fecha_pedido DESC;
```

### Obtener clientes VIP
```sql
SELECT * FROM clientes 
WHERE tipo = 'VIP' 
ORDER BY total_gastado DESC;
```

### Obtener productos más vendidos del mes
```sql
SELECT * FROM productos_mas_vendidos 
LIMIT 10;
```

### Obtener productos para catálogo público
```sql
SELECT * FROM productos_catalogo 
WHERE categoria_id = 'uuid-de-categoria'
ORDER BY es_best_seller DESC, calificacion_promedio DESC;
```

### Obtener carrito de un usuario
```sql
SELECT * FROM carrito_completo 
WHERE cliente_id = 'uuid-cliente' OR session_id = 'session-id';
```

### Obtener productos con filtros (precio, categoría, tipo)
```sql
SELECT * FROM productos_catalogo 
WHERE precio_final BETWEEN 50 AND 350
  AND tipo_producto = 'Casual'
  AND categoria_id = 'uuid-categoria'
ORDER BY precio_final ASC;
```

### Obtener reseñas aprobadas de un producto
```sql
SELECT * FROM producto_resenas 
WHERE producto_id = 'uuid-producto' 
  AND estado = 'Aprobada'
ORDER BY created_at DESC;
```

### Obtener estadísticas de ventas por día
```sql
SELECT 
    DATE(fecha_pedido) as fecha,
    COUNT(*) as total_pedidos,
    SUM(total) as ventas_totales
FROM pedidos
WHERE estado IN ('Completado', 'Enviado')
GROUP BY DATE(fecha_pedido)
ORDER BY fecha DESC;
```

## 🔐 Seguridad (RLS)

El esquema incluye Row Level Security (RLS) habilitado en todas las tablas. Las políticas actuales permiten acceso completo a administradores. Ajusta según tus necesidades de seguridad.

Para implementar autenticación con Supabase Auth:

```sql
-- Ejemplo de política con autenticación
CREATE POLICY "Users can view own data" ON clientes
    FOR SELECT USING (auth.uid() = user_id);
```

## 📝 Notas Importantes

1. **UUIDs**: Todas las tablas usan UUID como ID principal para mejor escalabilidad.

2. **JSONB**: Los campos `atributos` en variantes y `configuracion` en diseño usan JSONB para flexibilidad.

3. **Índices**: Se han creado índices en campos frecuentemente consultados para optimizar rendimiento.

4. **Triggers**: Los triggers automáticos mantienen la integridad y consistencia de los datos.

5. **Soft Deletes**: Considera implementar soft deletes si necesitas mantener historial de registros eliminados.

## 🛠️ Mantenimiento

### Backup Regular
Supabase realiza backups automáticos, pero puedes crear backups manuales desde el panel.

### Monitoreo de Rendimiento
Usa el dashboard de Supabase para monitorear:
- Consultas lentas
- Uso de almacenamiento
- Conexiones activas

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)


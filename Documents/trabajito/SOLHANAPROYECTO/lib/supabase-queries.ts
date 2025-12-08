import { supabase } from './supabase'

// ============================================
// QUERIES PARA PRODUCTOS
// ============================================

export async function getProductos(filters?: {
  estado?: string
  search?: string
  categoria_id?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('productos')
    .select(`
      id,
      sku,
      nombre,
      precio,
      descuento,
      stock,
      estado,
      categoria_id,
      categoria:categorias(nombre),
      producto_imagenes(url, es_principal, orden)
    `)

  if (filters?.estado) {
    if (filters.estado === 'Activo') {
      query = query.eq('estado', 'Activo')
    } else if (filters.estado === 'Inactivo') {
      query = query.eq('estado', 'Inactivo')
    }
    // Si es 'Todos', no filtramos por estado
  } else {
    // Por defecto solo mostrar activos
    query = query.eq('estado', 'Activo')
  }

  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }

  if (filters?.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset !== undefined && filters?.limit) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTotalProductos(filters?: {
  estado?: string
  search?: string
  categoria_id?: string
}) {
  let query = supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })

  if (filters?.estado) {
    if (filters.estado === 'Activo') {
      query = query.eq('estado', 'Activo')
    } else if (filters.estado === 'Inactivo') {
      query = query.eq('estado', 'Inactivo')
    }
  } else {
    query = query.eq('estado', 'Activo')
  }

  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }

  if (filters?.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

export async function getProductoById(id: string) {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categoria:categorias(*),
      imagenes:producto_imagenes(*),
      variantes:producto_variantes(*),
      especificaciones:producto_especificaciones(*),
      resenas:producto_resenas(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function crearProducto(producto: {
  sku: string
  nombre: string
  descripcion?: string
  descripcion_corta?: string
  precio: number
  descuento?: number
  precio_original?: number
  stock: number
  categoria_id?: string
  tipo_producto?: string
  estado: 'Borrador' | 'Activo' | 'Inactivo'
  tiene_variantes?: boolean
  es_nuevo?: boolean
  es_best_seller?: boolean
  es_oferta?: boolean
  etiqueta_personalizada?: string
  tiempo_envio?: string
  variantes?: Array<{
    atributos: any
    precio?: number
    sku: string
    stock: number
    activo: boolean
    imagen_url?: string
  }>
  especificaciones?: Array<{
    nombre: string
    valor?: string
  }>
  imagenes?: Array<{
    url: string
    orden?: number
    es_principal?: boolean
  }>
}) {
  // Verificar si el SKU ya existe
  const { data: existingProduct, error: checkError } = await supabase
    .from('productos')
    .select('id, nombre')
    .eq('sku', producto.sku)
    .maybeSingle()

  // Si hay un error que no sea "no encontrado", lanzarlo
  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError
  }

  // Si el producto existe, lanzar error de SKU duplicado
  if (existingProduct) {
    const error = new Error(`El SKU "${producto.sku}" ya está en uso por el producto "${existingProduct.nombre}". Por favor, usa un SKU diferente.`)
    ;(error as any).code = 'DUPLICATE_SKU'
    throw error
  }

  // Crear el producto principal
  const { data: productoData, error: productoError } = await supabase
    .from('productos')
    .insert({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || null,
      descripcion_corta: producto.descripcion_corta || null,
      precio: producto.precio,
      descuento: producto.descuento || 0,
      precio_original: producto.precio_original || null,
      stock: producto.stock,
      categoria_id: producto.categoria_id || null,
      tipo_producto: producto.tipo_producto || null,
      estado: producto.estado,
      tiene_variantes: producto.tiene_variantes || false,
      es_nuevo: producto.es_nuevo || false,
      es_best_seller: producto.es_best_seller || false,
      es_oferta: producto.es_oferta || false,
      etiqueta_personalizada: producto.etiqueta_personalizada || null,
      tiempo_envio: producto.tiempo_envio || '24 horas'
    })
    .select()
    .single()

  if (productoError) {
    // Mejorar el mensaje de error para SKU duplicado
    if (productoError.code === '23505' && productoError.message?.includes('productos_sku_key')) {
      const error = new Error(`El SKU "${producto.sku}" ya está en uso. Por favor, usa un SKU diferente.`)
      ;(error as any).code = 'DUPLICATE_SKU'
      throw error
    }
    throw productoError
  }

  const productoId = productoData.id

  // Crear variantes si existen
  if (producto.variantes && producto.variantes.length > 0) {
    // Verificar SKUs duplicados en las variantes antes de insertar
    const skus = producto.variantes.map(v => v.sku).filter(Boolean)
    const skusDuplicados = skus.filter((sku, index) => skus.indexOf(sku) !== index)
    
    if (skusDuplicados.length > 0) {
      const error = new Error(`Los SKUs de las variantes deben ser únicos. El SKU "${skusDuplicados[0]}" está duplicado.`)
      ;(error as any).code = 'DUPLICATE_VARIANT_SKU'
      throw error
    }

    // Verificar si algún SKU de variante ya existe en la base de datos
    if (skus.length > 0) {
      const { data: existingVariants, error: checkError } = await supabase
        .from('producto_variantes')
        .select('sku')
        .in('sku', skus)

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingVariants && existingVariants.length > 0) {
        const existingSku = existingVariants[0].sku
        const error = new Error(`El SKU de variante "${existingSku}" ya está en uso. Por favor, usa un SKU diferente.`)
        ;(error as any).code = 'DUPLICATE_VARIANT_SKU'
        throw error
      }
    }

    const variantesData = producto.variantes.map(variante => ({
      producto_id: productoId,
      atributos: typeof variante.atributos === 'string' ? JSON.parse(variante.atributos) : variante.atributos,
      precio: variante.precio || null,
      sku: variante.sku || null,
      stock: variante.stock || 0,
      activo: variante.activo !== undefined ? variante.activo : true,
      imagen_url: variante.imagen_url || null
    }))

    const { error: variantesError } = await supabase
      .from('producto_variantes')
      .insert(variantesData)

    if (variantesError) {
      // Mejorar el mensaje de error para SKU duplicado
      if (variantesError.code === '23505' && variantesError.message?.includes('producto_variantes_sku_key')) {
        const error = new Error(`El SKU de una variante ya está en uso. Por favor, verifica que todos los SKUs de las variantes sean únicos.`)
        ;(error as any).code = 'DUPLICATE_VARIANT_SKU'
        throw error
      }
      // Lanzar el error en lugar de solo loguearlo
      console.error('Error creando variantes:', variantesError)
      throw variantesError
    }
  }

  // Crear especificaciones si existen
  if (producto.especificaciones && producto.especificaciones.length > 0) {
    const especificacionesData = producto.especificaciones.map(espec => ({
      producto_id: productoId,
      nombre: espec.nombre,
      valor: espec.valor || null
    }))

    const { error: especError } = await supabase
      .from('producto_especificaciones')
      .insert(especificacionesData)

    if (especError) {
      console.error('Error creando especificaciones:', especError)
      // No lanzar error, solo loguear
    }
  }

  // Crear imágenes si existen
  if (producto.imagenes && producto.imagenes.length > 0) {
    const imagenesData = producto.imagenes.map((img, index) => ({
      producto_id: productoId,
      url: img.url,
      orden: img.orden || index,
      es_principal: img.es_principal || index === 0
    }))

    const { error: imagenesError } = await supabase
      .from('producto_imagenes')
      .insert(imagenesData)

    if (imagenesError) {
      console.error('Error creando imágenes:', imagenesError)
      // No lanzar error, solo loguear
    }
  }

  return productoData
}

export async function actualizarProducto(
  id: string,
  producto: {
    sku?: string
    nombre?: string
    descripcion?: string
    descripcion_corta?: string
    precio?: number
    descuento?: number
    precio_original?: number
    stock?: number
    categoria_id?: string
    tipo_producto?: string
    estado?: 'Borrador' | 'Activo' | 'Inactivo'
    tiene_variantes?: boolean
    es_nuevo?: boolean
    es_best_seller?: boolean
    es_oferta?: boolean
    etiqueta_personalizada?: string
    tiempo_envio?: string
  }
) {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Funciones para gestionar variantes
export async function actualizarVariantesProducto(
  productoId: string,
  variantes: Array<{
    id?: string // Si tiene id, es una variante existente a actualizar
    atributos: any
    precio?: number
    sku: string
    stock: number
    activo: boolean
    imagen_url?: string
  }>
) {
  // Verificar SKUs duplicados en las variantes antes de actualizar
  const skus = variantes.map(v => v.sku).filter(Boolean)
  const skusDuplicados = skus.filter((sku, index) => skus.indexOf(sku) !== index)
  
  if (skusDuplicados.length > 0) {
    const error = new Error(`Los SKUs de las variantes deben ser únicos. El SKU "${skusDuplicados[0]}" está duplicado.`)
    ;(error as any).code = 'DUPLICATE_VARIANT_SKU'
    throw error
  }

  // Obtener variantes existentes
  const { data: variantesExistentes } = await supabase
    .from('producto_variantes')
    .select('id, sku')
    .eq('producto_id', productoId)

  const idsExistentes = (variantesExistentes || []).map(v => v.id)
  const variantesConId = variantes.filter(v => v.id && idsExistentes.includes(v.id))
  const variantesSinId = variantes.filter(v => !v.id || !idsExistentes.includes(v.id))

  // Eliminar variantes que ya no existen
  const idsAMantener = variantesConId.map(v => v.id).filter(Boolean) as string[]
  const idsAEliminar = idsExistentes.filter(id => !idsAMantener.includes(id))

  if (idsAEliminar.length > 0) {
    const { error: deleteError } = await supabase
      .from('producto_variantes')
      .delete()
      .in('id', idsAEliminar)

    if (deleteError) {
      console.error('Error eliminando variantes:', deleteError)
    }
  }

  // Actualizar variantes existentes
  for (const variante of variantesConId) {
    if (!variante.id) continue
    
    const { error: updateError } = await supabase
      .from('producto_variantes')
      .update({
        atributos: variante.atributos,
        precio: variante.precio || null,
        sku: variante.sku,
        stock: variante.stock,
        activo: variante.activo,
        imagen_url: variante.imagen_url || null
      })
      .eq('id', variante.id)

    if (updateError) {
      console.error('Error actualizando variante:', updateError)
    }
  }

  // Crear nuevas variantes
  if (variantesSinId.length > 0) {
    const nuevasVariantes = variantesSinId.map(v => ({
      producto_id: productoId,
      atributos: v.atributos,
      precio: v.precio || null,
      sku: v.sku,
      stock: v.stock,
      activo: v.activo,
      imagen_url: v.imagen_url || null
    }))

    const { error: insertError } = await supabase
      .from('producto_variantes')
      .insert(nuevasVariantes)

    if (insertError) {
      // Mejorar el mensaje de error para SKU duplicado
      if (insertError.code === '23505' && insertError.message?.includes('producto_variantes_sku_key')) {
        const error = new Error(`El SKU de una variante ya está en uso. Por favor, verifica que todos los SKUs de las variantes sean únicos.`)
        ;(error as any).code = 'DUPLICATE_VARIANT_SKU'
        throw error
      }
      console.error('Error creando variantes:', insertError)
      throw insertError
    }
  }
}

export async function eliminarProducto(id: string) {
  // Supabase eliminará automáticamente las relaciones (variantes, especificaciones, imágenes)
  // debido a ON DELETE CASCADE
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getProductosCatalogo(filters?: {
  categoria_id?: string
  tipo_producto?: string
  precio_min?: number
  precio_max?: number
  es_nuevo?: boolean
  es_best_seller?: boolean
  es_oferta?: boolean
  search?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('productos_catalogo')
    .select('*')

  if (filters?.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }

  if (filters?.tipo_producto) {
    query = query.eq('tipo_producto', filters.tipo_producto)
  }

  if (filters?.precio_min) {
    query = query.gte('precio_final', filters.precio_min)
  }

  if (filters?.precio_max) {
    query = query.lte('precio_final', filters.precio_max)
  }

  if (filters?.es_nuevo) {
    query = query.eq('es_nuevo', true)
  }

  if (filters?.es_best_seller) {
    query = query.eq('es_best_seller', true)
  }

  if (filters?.es_oferta) {
    query = query.eq('es_oferta', true)
  }

  if (filters?.search) {
    query = query.ilike('nombre', `%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// QUERIES PARA CATEGORÍAS
// ============================================

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error en getCategorias:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw error
  }
  return data
}

export async function getCategoriaById(id: string) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ============================================
// QUERIES PARA CARRITO
// ============================================

export async function getCarrito(clienteId?: string, sessionId?: string) {
  let query = supabase
    .from('carrito_completo')
    .select('*')

  if (clienteId) {
    query = query.eq('cliente_id', clienteId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function agregarAlCarrito(item: {
  cliente_id?: string
  session_id?: string
  producto_id: string
  variante_id?: string
  cantidad: number
  precio_unitario: number
  color?: string
  talla?: string
}) {
  const { data, error } = await supabase
    .from('carrito')
    .upsert(item, {
      onConflict: 'cliente_id,producto_id,variante_id,session_id'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarCantidadCarrito(
  id: string,
  cantidad: number
) {
  const { data, error } = await supabase
    .from('carrito')
    .update({ cantidad })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarDelCarrito(id: string) {
  const { error } = await supabase
    .from('carrito')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function limpiarCarrito(clienteId?: string, sessionId?: string) {
  let query = supabase.from('carrito').delete()

  if (clienteId) {
    query = query.eq('cliente_id', clienteId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { error } = await query
  if (error) throw error
}

// ============================================
// QUERIES PARA PEDIDOS
// ============================================

export async function crearPedido(pedido: {
  cliente_id?: string
  nombre_cliente?: string
  apellido_cliente?: string
  telefono_cliente?: string
  email_cliente?: string
  subtotal: number
  descuento?: number
  costo_envio?: number
  envio_prioritario?: boolean
  total: number
  metodo_pago: string
  metodo_envio?: string
  direccion_completa?: string
  ciudad_envio?: string
  referencias_envio?: string
  items: Array<{
    producto_id: string
    variante_id?: string
    nombre_producto: string
    sku?: string
    precio_unitario: number
    cantidad: number
    subtotal: number
  }>
}) {
  // Crear el pedido
  const { data: pedidoData, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      cliente_id: pedido.cliente_id || null,
      nombre_cliente: pedido.nombre_cliente,
      apellido_cliente: pedido.apellido_cliente,
      telefono_cliente: pedido.telefono_cliente,
      email_cliente: pedido.email_cliente,
      subtotal: pedido.subtotal,
      descuento: pedido.descuento || 0,
      costo_envio: pedido.costo_envio || 0,
      envio_prioritario: pedido.envio_prioritario || false,
      total: pedido.total,
      metodo_pago: pedido.metodo_pago,
      metodo_envio: pedido.metodo_envio,
      direccion_completa: pedido.direccion_completa,
      ciudad_envio: pedido.ciudad_envio,
      referencias_envio: pedido.referencias_envio,
    })
    .select()
    .single()

  if (pedidoError) throw pedidoError

  // Crear los items del pedido
  const items = pedido.items.map(item => ({
    ...item,
    pedido_id: pedidoData.id
  }))

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(items)

  if (itemsError) throw itemsError

  return pedidoData
}

export async function getPedidos(filters?: {
  clienteId?: string
  estado?: string
  search?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('pedidos')
    .select('id, numero_pedido, nombre_cliente, apellido_cliente, fecha_pedido, total, estado, email_cliente, telefono_cliente')

  if (filters?.clienteId) {
    query = query.eq('cliente_id', filters.clienteId)
  }

  if (filters?.estado && filters.estado !== 'Todos') {
    query = query.eq('estado', filters.estado)
  }

  if (filters?.search) {
    query = query.or(`numero_pedido.ilike.%${filters.search}%,nombre_cliente.ilike.%${filters.search}%,apellido_cliente.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset !== undefined && filters?.limit) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1)
  }

  const { data, error } = await query.order('fecha_pedido', { ascending: false })

  if (error) throw error
  return data
}

export async function getTotalPedidos(filters?: {
  clienteId?: string
  estado?: string
  search?: string
}) {
  let query = supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })

  if (filters?.clienteId) {
    query = query.eq('cliente_id', filters.clienteId)
  }

  if (filters?.estado && filters.estado !== 'Todos') {
    query = query.eq('estado', filters.estado)
  }

  if (filters?.search) {
    query = query.or(`numero_pedido.ilike.%${filters.search}%,nombre_cliente.ilike.%${filters.search}%,apellido_cliente.ilike.%${filters.search}%`)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

// Función para verificar si un string es un UUID válido
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function getPedidoById(id: string) {
  console.log('🔍 getPedidoById llamado con ID:', id)
  
  // Limpiar el ID (remover # si existe)
  const cleanId = id.replace(/^#/, '')
  const isUUID = isValidUUID(cleanId)
  
  console.log('🔍 ID limpio:', cleanId, '¿Es UUID?', isUUID)
  
  let query = supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes(*),
      items:pedido_items(
        *,
        producto:productos(
          id,
          nombre,
          sku,
          imagenes:producto_imagenes(url, es_principal, orden)
        ),
        variante:producto_variantes(
          id,
          atributos,
          sku,
          imagen_url
        )
      ),
      historial:pedido_historial(*)
    `)

  // Si es un UUID válido, buscar por id, sino buscar solo por numero_pedido
  if (isUUID) {
    query = query.or(`numero_pedido.eq.${cleanId},id.eq.${cleanId}`)
  } else {
    // Si no es UUID, buscar por numero_pedido (con diferentes formatos posibles)
    // Intentar primero con el valor exacto
    query = query.eq('numero_pedido', cleanId)
  }
  
  query = query.limit(1)

  const { data, error } = await query

  if (error) {
    console.error('❌ Error en getPedidoById:', error)
    throw error
  }
  
  if (!data || data.length === 0) {
    console.log('⚠️ No se encontró pedido con numero_pedido:', cleanId)
    console.log('🔍 Intentando búsqueda alternativa...')
    
    // Si no se encontró, intentar buscar todos los pedidos para ver qué formatos tienen
    const { data: allPedidos } = await supabase
      .from('pedidos')
      .select('id, numero_pedido')
      .limit(10)
    
    console.log('📋 Primeros 10 pedidos en BD:', allPedidos?.map(p => ({ id: p.id.slice(0, 8), numero: p.numero_pedido })))
    
    // Intentar buscar con el ID formateado con #
    const withHash = `#${cleanId}`
    const { data: dataWithHash } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(*),
        items:pedido_items(
          *,
          producto:productos(
            id,
            nombre,
            sku,
            imagenes:producto_imagenes(url, es_principal, orden)
          ),
          variante:producto_variantes(
            id,
            atributos,
            sku
          )
        ),
        historial:pedido_historial(*)
      `)
      .eq('numero_pedido', withHash)
      .limit(1)
    
    if (dataWithHash && dataWithHash.length > 0) {
      console.log('✅ Pedido encontrado con #:', dataWithHash[0].id)
      return dataWithHash[0]
    }
    
    return null
  }
  
  const pedido = data[0]
  console.log('✅ Pedido encontrado:', pedido.id, 'numero_pedido:', pedido.numero_pedido, 'Items:', pedido.items?.length || 0)
  
  return pedido
}

// ============================================
// QUERIES PARA CLIENTES
// ============================================

export async function crearCliente(cliente: {
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  whatsapp?: string
}) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(cliente)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getClientes(filters?: {
  search?: string
  tipo?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('clientes')
    .select('*')

  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%,telefono.ilike.%${filters.search}%,whatsapp.ilike.%${filters.search}%`)
  }

  if (filters?.tipo && filters.tipo !== 'Todos') {
    query = query.eq('tipo', filters.tipo)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset !== undefined && filters?.limit) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1)
  }

  const { data, error } = await query.order('fecha_registro', { ascending: false })

  if (error) throw error
  return data
}

export async function getTotalClientes(filters?: {
  search?: string
  tipo?: string
}) {
  let query = supabase
    .from('clientes')
    .select('id', { count: 'exact', head: true })

  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%,telefono.ilike.%${filters.search}%,whatsapp.ilike.%${filters.search}%`)
  }

  if (filters?.tipo && filters.tipo !== 'Todos') {
    query = query.eq('tipo', filters.tipo)
  }

  const { count, error } = await query

  if (error) throw error
  return count || 0
}

export async function actualizarCliente(
  id: string,
  cliente: {
    nombre?: string
    apellido?: string
    email?: string
    telefono?: string
    whatsapp?: string
    tipo?: 'Nuevo' | 'Recurrente' | 'VIP'
  }
) {
  const { data, error } = await supabase
    .from('clientes')
    .update(cliente)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarCliente(id: string) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// QUERIES PARA RESEÑAS
// ============================================

export async function getResenasProducto(productoId: string) {
  const { data, error } = await supabase
    .from('producto_resenas')
    .select('*')
    .eq('producto_id', productoId)
    .eq('estado', 'Aprobada')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function crearResena(resena: {
  producto_id: string
  cliente_id?: string
  nombre_cliente?: string
  email_cliente?: string
  calificacion: number
  titulo?: string
  comentario?: string
}) {
  const { data, error } = await supabase
    .from('producto_resenas')
    .insert(resena)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// QUERIES PARA MÉTODOS DE PAGO Y ENVÍO
// ============================================

export async function getMetodosPago() {
  const { data, error } = await supabase
    .from('metodos_pago')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function getMetodosEnvio() {
  const { data, error } = await supabase
    .from('metodos_envio')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function getCiudadesEnvio() {
  const { data, error } = await supabase
    .from('ciudades_envio')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

// ============================================
// QUERIES PARA NEWSLETTER
// ============================================

export async function suscribirNewsletter(email: string, nombre?: string) {
  const { data, error } = await supabase
    .from('newsletter_suscripciones')
    .upsert({
      email,
      nombre,
      activo: true,
      confirmado: false
    }, {
      onConflict: 'email'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// QUERIES PARA PRODUCTOS RELACIONADOS
// ============================================

export async function getProductosRelacionados(productoId: string) {
  const { data, error } = await supabase
    .from('productos_relacionados')
    .select(`
      producto_relacionado_id,
      producto_relacionado:productos!productos_relacionados_producto_relacionado_id_fkey(*)
    `)
    .eq('producto_id', productoId)
    .order('orden', { ascending: true })
    .limit(4)

  if (error) throw error
  return data?.map(item => item.producto_relacionado)
}

// ============================================
// QUERIES PARA DASHBOARD
// ============================================

export async function getDashboardKPIs() {
  // Obtener ventas totales y pedidos
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('total, fecha_pedido')
    .neq('estado', 'Cancelado')

  if (pedidosError) throw pedidosError

  // Calcular ventas totales
  const ventasTotales = pedidos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0

  // Contar pedidos
  const totalPedidos = pedidos?.length || 0

  // Obtener pedidos del mes anterior para comparación
  const ahora = new Date()
  const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const { data: pedidosMesAnterior } = await supabase
    .from('pedidos')
    .select('total')
    .neq('estado', 'Cancelado')
    .gte('fecha_pedido', mesAnterior.toISOString())
    .lt('fecha_pedido', inicioMesActual.toISOString())

  const ventasMesAnterior = pedidosMesAnterior?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
  const pedidosMesAnteriorCount = pedidosMesAnterior?.length || 0

  // Calcular cambios porcentuales
  const cambioVentas = ventasMesAnterior > 0 
    ? ((ventasTotales - ventasMesAnterior) / ventasMesAnterior) * 100 
    : 0
  
  const cambioPedidos = pedidosMesAnteriorCount > 0
    ? ((totalPedidos - pedidosMesAnteriorCount) / pedidosMesAnteriorCount) * 100
    : 0

  return {
    ventasTotales,
    totalPedidos,
    cambioVentas,
    cambioPedidos,
    // Valores mock para visitantes y conversión (no están en la BD)
    visitantesUnicos: 1200,
    cambioVisitantes: -1.5,
    tasaConversion: 2.5,
    cambioConversion: 0.2
  }
}

export async function getUltimosPedidos(limit: number = 5) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, numero_pedido, nombre_cliente, apellido_cliente, fecha_pedido, total, estado')
    .order('fecha_pedido', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data?.map(pedido => ({
    id: pedido.numero_pedido || `#${pedido.id.slice(0, 8)}`,
    cliente: `${pedido.nombre_cliente || ''} ${pedido.apellido_cliente || ''}`.trim() || 'Cliente',
    fecha: new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    total: `Bs. ${pedido.total.toFixed(2)}`,
    estado: pedido.estado as 'Enviado' | 'Procesando' | 'Cancelado' | 'Pendiente' | 'Completado'
  })) || []
}

export async function getProductosMasVendidos(limit: number = 3) {
  try {
    // Intentar usar la vista primero
    const { data, error } = await supabase
      .from('productos_mas_vendidos')
      .select('*')
      .order('unidades_vendidas', { ascending: false })
      .limit(limit)

    if (error) {
      // Si la vista no existe, calcular desde pedido_items
      console.warn('Vista productos_mas_vendidos no disponible, calculando desde pedido_items:', error.message)
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('pedido_items')
        .select(`
          producto_id,
          cantidad,
          producto:productos(id, nombre, sku)
        `)
        .limit(1000) // Limitar para no sobrecargar

      if (itemsError) throw itemsError

      // Agrupar por producto
      const productosMap: { [key: string]: { nombre: string, sku: string, total: number } } = {}
      
      itemsData?.forEach(item => {
        const producto = item.producto as any
        if (producto) {
          const key = producto.id
          if (!productosMap[key]) {
            productosMap[key] = {
              nombre: producto.nombre,
              sku: producto.sku,
              total: 0
            }
          }
          productosMap[key].total += item.cantidad || 0
        }
      })

      // Convertir a array y ordenar
      const productosArray = Object.values(productosMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)

      return productosArray.map(p => ({
        name: p.nombre,
        sku: p.sku,
        sold: p.total,
        image: '📦'
      }))
    }

    return data?.map(producto => ({
      name: producto.nombre,
      sku: producto.sku,
      sold: producto.unidades_vendidas || 0,
      image: '📦'
    })) || []
  } catch (error: any) {
    console.error('Error en getProductosMasVendidos:', {
      message: error?.message,
      code: error?.code,
      details: error?.details
    })
    throw error
  }
}

export async function getProductosBajoStock(limit: number = 5, umbral: number = 10) {
  try {
    // Obtener productos activos (sin imagen_principal que no existe)
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, sku, stock')
      .eq('estado', 'Activo')
      .order('stock', { ascending: true })
      .limit(50) // Obtener más para filtrar

    if (error) {
      console.error('Error en getProductosBajoStock:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    // Filtrar en memoria los que tienen stock menor al umbral
    const productosBajoStock = (data || [])
      .filter(producto => (producto.stock || 0) < umbral)
      .slice(0, limit)
      .map(producto => ({
        name: producto.nombre,
        sku: producto.sku,
        stock: producto.stock || 0,
        image: '📦' // Placeholder - las imágenes están en producto_imagenes
      }))

    return productosBajoStock
  } catch (error: any) {
    console.error('Error completo en getProductosBajoStock:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    })
    // Retornar array vacío en lugar de lanzar error para no romper la UI
    return []
  }
}

export async function getVentasPorPeriodo(periodo: 'Hoy' | 'Semana' | 'Mes' = 'Semana') {
  const ahora = new Date()
  let fechaInicio: Date

  switch (periodo) {
    case 'Hoy':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      break
    case 'Semana':
      fechaInicio = new Date(ahora)
      fechaInicio.setDate(ahora.getDate() - 7)
      break
    case 'Mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('total, fecha_pedido')
    .gte('fecha_pedido', fechaInicio.toISOString())
    .neq('estado', 'Cancelado')

  if (error) throw error

  // Agrupar por día
  const ventasPorDia: { [key: string]: number } = {}
  
  data?.forEach(pedido => {
    const fecha = new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    })
    ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + (pedido.total || 0)
  })

  // Calcular total y cambio
  const total = data?.reduce((sum, p) => sum + (p.total || 0), 0) || 0

  // Obtener período anterior para comparación
  const diasAtras = periodo === 'Hoy' ? 1 : periodo === 'Semana' ? 7 : 30
  const fechaInicioAnterior = new Date(fechaInicio)
  fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasAtras)

  const { data: datosAnteriores } = await supabase
    .from('pedidos')
    .select('total')
    .gte('fecha_pedido', fechaInicioAnterior.toISOString())
    .lt('fecha_pedido', fechaInicio.toISOString())
    .neq('estado', 'Cancelado')

  const totalAnterior = datosAnteriores?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
  const cambio = totalAnterior > 0 ? ((total - totalAnterior) / totalAnterior) * 100 : 0

  return {
    total,
    cambio,
    ventasPorDia,
    periodo
  }
}

// ============================================
// QUERIES PARA REPORTES Y ANALÍTICAS
// ============================================

export async function getReportesKPIs(periodo: 'Hoy' | 'Últimos 7 días' | 'Este Mes' | 'Rango Personalizado' = 'Este Mes') {
  const ahora = new Date()
  let fechaInicio: Date

  switch (periodo) {
    case 'Hoy':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      break
    case 'Últimos 7 días':
      fechaInicio = new Date(ahora)
      fechaInicio.setDate(ahora.getDate() - 7)
      break
    case 'Este Mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    case 'Rango Personalizado':
      // Por defecto usar "Este Mes" si es rango personalizado sin fechas definidas
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  }

  // Obtener pedidos del período actual
  const { data: pedidosActuales, error: pedidosError } = await supabase
    .from('pedidos')
    .select('total, fecha_pedido')
    .gte('fecha_pedido', fechaInicio.toISOString())
    .neq('estado', 'Cancelado')

  if (pedidosError) throw pedidosError

  // Calcular ventas totales
  const ventasTotales = pedidosActuales?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
  const totalPedidos = pedidosActuales?.length || 0

  // Calcular valor promedio de pedido
  const valorPromedioPedido = totalPedidos > 0 ? ventasTotales / totalPedidos : 0

  // Obtener período anterior para comparación
  const diasAtras = periodo === 'Hoy' ? 1 : periodo === 'Últimos 7 días' ? 7 : 30
  const fechaInicioAnterior = new Date(fechaInicio)
  fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasAtras)

  const { data: pedidosAnteriores } = await supabase
    .from('pedidos')
    .select('total')
    .gte('fecha_pedido', fechaInicioAnterior.toISOString())
    .lt('fecha_pedido', fechaInicio.toISOString())
    .neq('estado', 'Cancelado')

  const ventasAnteriores = pedidosAnteriores?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
  const pedidosAnterioresCount = pedidosAnteriores?.length || 0
  const valorPromedioAnterior = pedidosAnterioresCount > 0 ? ventasAnteriores / pedidosAnterioresCount : 0

  // Calcular cambios porcentuales
  const cambioVentas = ventasAnteriores > 0 
    ? ((ventasTotales - ventasAnteriores) / ventasAnteriores) * 100 
    : 0
  
  const cambioPedidos = pedidosAnterioresCount > 0
    ? ((totalPedidos - pedidosAnterioresCount) / pedidosAnterioresCount) * 100
    : 0

  const cambioValorPromedio = valorPromedioAnterior > 0
    ? ((valorPromedioPedido - valorPromedioAnterior) / valorPromedioAnterior) * 100
    : 0

  return {
    ventasTotales,
    totalPedidos,
    valorPromedioPedido,
    cambioVentas,
    cambioPedidos,
    cambioValorPromedio,
    // Valores mock para conversión (no están en la BD)
    tasaConversion: 3.45,
    cambioConversion: -0.5
  }
}

export async function getVentasPorDia(periodo: 'Hoy' | 'Últimos 7 días' | 'Este Mes' | 'Rango Personalizado' = 'Este Mes') {
  const ahora = new Date()
  let fechaInicio: Date

  switch (periodo) {
    case 'Hoy':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      break
    case 'Últimos 7 días':
      fechaInicio = new Date(ahora)
      fechaInicio.setDate(ahora.getDate() - 7)
      break
    case 'Este Mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    case 'Rango Personalizado':
      // Por defecto usar "Este Mes" si es rango personalizado sin fechas definidas
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('total, fecha_pedido')
    .gte('fecha_pedido', fechaInicio.toISOString())
    .neq('estado', 'Cancelado')
    .order('fecha_pedido', { ascending: true })

  if (error) throw error

  // Agrupar por día
  const ventasPorDia: Array<{ fecha: string, total: number }> = []
  const ventasMap: { [key: string]: number } = {}
  
  data?.forEach(pedido => {
    const fecha = new Date(pedido.fecha_pedido).toISOString().split('T')[0]
    ventasMap[fecha] = (ventasMap[fecha] || 0) + (pedido.total || 0)
  })

  // Convertir a array ordenado
  Object.keys(ventasMap).sort().forEach(fecha => {
    ventasPorDia.push({
      fecha,
      total: ventasMap[fecha]
    })
  })

  return ventasPorDia
}

export async function getProductosMasVendidosReporte(limit: number = 10) {
  try {
    // Intentar usar la vista primero
    const { data, error } = await supabase
      .from('productos_mas_vendidos')
      .select('*')
      .order('unidades_vendidas', { ascending: false })
      .limit(limit)

    if (error) {
      // Si la vista no existe, calcular desde pedido_items
      const { data: itemsData, error: itemsError } = await supabase
        .from('pedido_items')
        .select(`
          producto_id,
          cantidad,
          subtotal,
          producto:productos(id, nombre, sku)
        `)
        .limit(1000)

      if (itemsError) throw itemsError

      // Agrupar por producto
      const productosMap: { [key: string]: { nombre: string, sku: string, unidades: number, ingresos: number } } = {}
      
      itemsData?.forEach(item => {
        const producto = item.producto as any
        if (producto) {
          const key = producto.id
          if (!productosMap[key]) {
            productosMap[key] = {
              nombre: producto.nombre,
              sku: producto.sku,
              unidades: 0,
              ingresos: 0
            }
          }
          productosMap[key].unidades += item.cantidad || 0
          productosMap[key].ingresos += item.subtotal || 0
        }
      })

      // Convertir a array y ordenar
      const productosArray = Object.values(productosMap)
        .sort((a, b) => b.unidades - a.unidades)
        .slice(0, limit)

      return productosArray.map(p => ({
        sku: p.sku,
        nombre: p.nombre,
        unidades: p.unidades,
        ingresos: p.ingresos
      }))
    }

    return data?.map(producto => ({
      sku: producto.sku,
      nombre: producto.nombre,
      unidades: producto.unidades_vendidas || 0,
      ingresos: producto.ingresos_totales || 0
    })) || []
  } catch (error: any) {
    console.error('Error en getProductosMasVendidosReporte:', error)
    throw error
  }
}

export async function getVentasPorCategoria(periodo: 'Hoy' | 'Últimos 7 días' | 'Este Mes' | 'Rango Personalizado' = 'Este Mes') {
  const ahora = new Date()
  let fechaInicio: Date

  switch (periodo) {
    case 'Hoy':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      break
    case 'Últimos 7 días':
      fechaInicio = new Date(ahora)
      fechaInicio.setDate(ahora.getDate() - 7)
      break
    case 'Este Mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    case 'Rango Personalizado':
      // Por defecto usar "Este Mes" si es rango personalizado sin fechas definidas
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      break
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  }

  const { data, error } = await supabase
    .from('pedido_items')
    .select(`
      cantidad,
      subtotal,
      producto:productos(categoria_id, categoria:categorias(nombre))
    `)
    .gte('created_at', fechaInicio.toISOString())

  if (error) throw error

  // Agrupar por categoría
  const categoriasMap: { [key: string]: { nombre: string, unidades: number } } = {}
  
  data?.forEach(item => {
    const categoria = (item.producto as any)?.categoria
    const nombreCategoria = categoria?.nombre || 'Sin categoría'
    
    if (!categoriasMap[nombreCategoria]) {
      categoriasMap[nombreCategoria] = {
        nombre: nombreCategoria,
        unidades: 0
      }
    }
    categoriasMap[nombreCategoria].unidades += item.cantidad || 0
  })

  // Convertir a array y ordenar
  const categoriasArray = Object.values(categoriasMap)
    .sort((a, b) => b.unidades - a.unidades)

  const totalUnidades = categoriasArray.reduce((sum, c) => sum + c.unidades, 0)

  return categoriasArray.map(cat => ({
    nombre: cat.nombre,
    unidades: cat.unidades,
    porcentaje: totalUnidades > 0 ? (cat.unidades / totalUnidades) * 100 : 0
  }))
}

// ============================================
// QUERIES PARA DISEÑO DE PÁGINA
// ============================================

export async function getDisenoPagina() {
  const { data, error } = await supabase
    .from('diseno_pagina')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function getBanners() {
  const { data, error } = await supabase
    .from('diseno_pagina')
    .select('*')
    .eq('tipo', 'banner')
    .order('orden', { ascending: true })

  if (error) throw error
  
  // Filtrar banners duplicados por seccion (mantener solo el más reciente)
  if (data && data.length > 0) {
    const bannersMap = new Map()
    data.forEach((banner: any) => {
      const key = banner.seccion
      if (!bannersMap.has(key) || new Date(banner.updated_at || banner.created_at) > new Date(bannersMap.get(key).updated_at || bannersMap.get(key).created_at)) {
        bannersMap.set(key, banner)
      }
    })
    return Array.from(bannersMap.values()).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
  }
  
  return data
}

export async function getSecciones() {
  const { data, error } = await supabase
    .from('diseno_pagina')
    .select('*')
    .eq('tipo', 'seccion')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function guardarBanner(banner: {
  id?: string
  seccion: string
  configuracion: {
    imagen?: string | null
    titulo?: string
    subtitulo?: string
    textoBoton?: string
  }
  url_enlace?: string
  visible?: boolean
  orden?: number
}) {
  const bannerData = {
    seccion: banner.seccion,
    tipo: 'banner',
    configuracion: banner.configuracion,
    url_enlace: banner.url_enlace || null,
    visible: banner.visible !== undefined ? banner.visible : true,
    orden: banner.orden || 0
  }

  if (banner.id) {
    // Actualizar banner existente
    const { data, error } = await supabase
      .from('diseno_pagina')
      .update(bannerData)
      .eq('id', banner.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Crear nuevo banner
    const { data, error } = await supabase
      .from('diseno_pagina')
      .insert(bannerData)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function guardarSeccion(seccion: {
  id?: string
  seccion: string
  configuracion: any
  visible?: boolean
  orden?: number
}) {
  const seccionData = {
    seccion: seccion.seccion,
    tipo: 'seccion',
    configuracion: seccion.configuracion,
    visible: seccion.visible !== undefined ? seccion.visible : true,
    orden: seccion.orden || 0
  }

  if (seccion.id) {
    // Actualizar sección existente
    const { data, error } = await supabase
      .from('diseno_pagina')
      .update(seccionData)
      .eq('id', seccion.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Crear nueva sección
    const { data, error } = await supabase
      .from('diseno_pagina')
      .insert(seccionData)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function eliminarBanner(id: string) {
  const { error } = await supabase
    .from('diseno_pagina')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function actualizarOrdenBanners(banners: Array<{ id: string, orden: number }>) {
  // Actualizar el orden de múltiples banners
  const updates = banners.map(banner =>
    supabase
      .from('diseno_pagina')
      .update({ orden: banner.orden })
      .eq('id', banner.id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
    throw errors[0].error
  }
}

// ============================================
// QUERIES PARA CATEGORÍAS CON IMÁGENES
// ============================================

export async function getCategoriasConImagenes() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('estado', 'Activo')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function actualizarCategoriaImagen(
  categoriaId: string,
  datos: {
    imagen_url?: string
    banner_imagen_url?: string
    banner_titulo?: string
    banner_descripcion?: string
  }
) {
  const { data, error } = await supabase
    .from('categorias')
    .update(datos)
    .eq('id', categoriaId)
    .select()
    .single()

  if (error) throw error
  return data
}



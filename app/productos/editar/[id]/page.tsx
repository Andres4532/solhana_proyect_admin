'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon, XIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/Icons'
import { getProductoById, actualizarProducto, getCategorias, actualizarVariantesProducto } from '@/lib/supabase-queries'
import { showSuccess, showError } from '@/lib/swal'
import ImageUploader from '@/components/ImageUploader'
import AddAttributeModal from '@/components/AddAttributeModal'
import AddValueModal from '@/components/AddValueModal'
import styles from '../../nuevo/nuevo.module.css'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorias, setCategorias] = useState<Array<{ id: string, nombre: string }>>([])
  
  // Form data
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [descripcionCorta, setDescripcionCorta] = useState('')
  const [precio, setPrecio] = useState('')
  const [descuento, setDescuento] = useState('0')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [categoriaId, setCategoriaId] = useState('')
  const [tipoProducto, setTipoProducto] = useState('')
  const [productStatus, setProductStatus] = useState<'Borrador' | 'Activo' | 'Inactivo'>('Borrador')
  
  // Etiquetas
  const [esNuevo, setEsNuevo] = useState(false)
  const [esBestSeller, setEsBestSeller] = useState(false)
  const [esOferta, setEsOferta] = useState(false)

  // Variantes - Sistema dinámico
  const [hasVariants, setHasVariants] = useState(false)
  const [attributes, setAttributes] = useState<Array<{
    id: string
    name: string
    values: string[]
  }>>([])
  const [variants, setVariants] = useState<Array<{
    id: string
    dbId?: string // ID de la base de datos si existe
    attributes: Record<string, string>
    precio: string
    sku: string
    stock: number
    activo: boolean
  }>>([])

  // Imágenes
  const [imagenes, setImagenes] = useState<string[]>([])

  // Especificaciones
  const [specifications, setSpecifications] = useState<Array<{ id: string, name: string, valor?: string }>>([])

  // Errores de validación
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Modales
  const [showAddAttributeModal, setShowAddAttributeModal] = useState(false)
  const [showAddValueModal, setShowAddValueModal] = useState(false)
  const [selectedAttributeForValue, setSelectedAttributeForValue] = useState<string>('')

  // Obtener nombres de atributos existentes para filtrar
  const existingAttributeNames = attributes.map(a => a.name)

  // Cargar categorías y producto
  useEffect(() => {
    async function loadData() {
      try {
        // Cargar categorías
        const categoriasData = await getCategorias()
        setCategorias(categoriasData || [])

        // Cargar producto
        const producto = await getProductoById(id)
        
        if (producto) {
          setNombre(producto.nombre || '')
          setDescripcion(producto.descripcion || '')
          setDescripcionCorta(producto.descripcion_corta || '')
          setPrecio(producto.precio?.toString() || '')
          setDescuento(producto.descuento?.toString() || '0')
          setSku(producto.sku || '')
          setStock(producto.stock?.toString() || '0')
          setCategoriaId(producto.categoria_id || '')
          setTipoProducto(producto.tipo_producto || '')
          setProductStatus(producto.estado || 'Borrador')
          setEsNuevo(producto.es_nuevo || false)
          setEsBestSeller(producto.es_best_seller || false)
          setEsOferta(producto.es_oferta || false)
          setHasVariants(producto.tiene_variantes || false)

          // Cargar imágenes
          if (producto.imagenes && Array.isArray(producto.imagenes)) {
            setImagenes(producto.imagenes.map((img: any) => img.url).filter(Boolean))
          }

          // Cargar especificaciones
          if (producto.especificaciones && Array.isArray(producto.especificaciones)) {
            setSpecifications(producto.especificaciones.map((spec: any, index: number) => ({
              id: spec.id || `spec-${index}`,
              name: spec.nombre || '',
              valor: spec.valor || undefined
            })))
          }

          // Cargar variantes
          if (producto.variantes && Array.isArray(producto.variantes) && producto.variantes.length > 0) {
            const variantesCargadas = producto.variantes.map((v: any) => ({
              id: v.id || `variant-${Date.now()}`,
              dbId: v.id,
              attributes: v.atributos || {},
              precio: v.precio?.toString() || '0.00',
              sku: v.sku || '',
              stock: v.stock || 0,
              activo: v.activo !== false
            }))
            setVariants(variantesCargadas)

            // Extraer atributos únicos de las variantes existentes
            const atributosUnicos: { [key: string]: Set<string> } = {}
            variantesCargadas.forEach((v: any) => {
              Object.entries(v.attributes).forEach(([key, value]) => {
                if (!atributosUnicos[key]) {
                  atributosUnicos[key] = new Set()
                }
                atributosUnicos[key].add(value as string)
              })
            })

            // Convertir a formato de atributos
            const atributosArray = Object.entries(atributosUnicos).map(([name, values], index) => ({
              id: `attr-${index}`,
              name,
              values: Array.from(values)
            }))
            setAttributes(atributosArray)
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        await showError('Error al cargar', 'No se pudo cargar el producto')
        router.push('/productos')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, router])

  // Funciones para manejar atributos dinámicos
  const addAttribute = (name: string) => {
    const newAttr = {
      id: Date.now().toString(),
      name: name,
      values: []
    }
    setAttributes([...attributes, newAttr])
  }

  const removeAttribute = (attrId: string) => {
    setAttributes(attributes.filter(a => a.id !== attrId))
  }

  const handleOpenAddValueModal = (attrId: string) => {
    setSelectedAttributeForValue(attrId)
    setShowAddValueModal(true)
  }

  const addAttributeValue = (value: string) => {
    const attr = attributes.find(a => a.id === selectedAttributeForValue)
    if (!attr) return
    
    setAttributes(attributes.map(a => 
      a.id === selectedAttributeForValue 
        ? { ...a, values: [...a.values, value] }
        : a
    ))
  }

  const removeAttributeValue = (attrId: string, value: string) => {
    setAttributes(attributes.map(a => 
      a.id === attrId 
        ? { ...a, values: a.values.filter(v => v !== value) }
        : a
    ))
  }

  // Función para generar todas las combinaciones posibles de atributos
  const generateCombinations = (attrs: Array<{ name: string, values: string[] }>): Array<Record<string, string>> => {
    if (attrs.length === 0) return []
    
    const attrsWithValues = attrs.filter(a => a.values.length > 0)
    if (attrsWithValues.length === 0) return []

    const combine = (index: number, current: Record<string, string>): Array<Record<string, string>> => {
      if (index >= attrsWithValues.length) {
        return [current]
      }

      const results: Array<Record<string, string>> = []
      const attr = attrsWithValues[index]

      attr.values.forEach(value => {
        const newCombination = { ...current, [attr.name]: value }
        results.push(...combine(index + 1, newCombination))
      })

      return results
    }

    return combine(0, {})
  }

  // Generar variantes automáticamente cuando cambian los atributos
  useEffect(() => {
    if (!hasVariants) {
      // Si desactiva variantes, mantener las existentes pero no generar nuevas
      return
    }

    const activeAttributes = attributes.filter(a => a.values.length > 0)
    
    if (activeAttributes.length === 0) {
      return
    }

    const combinations = generateCombinations(activeAttributes)
    
    // Función para generar SKU único basado en atributos (misma lógica que nuevo producto)
    const generateVariantSKU = (combo: Record<string, string>, baseSKU: string, index: number, usedSKUs: Set<string>): string => {
      const sortedEntries = Object.entries(combo).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      
      // Calcular un hash simple basado en los valores para mayor unicidad
      const valuesString = sortedEntries.map(([_, value]) => value).join('')
      const hash = valuesString.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
      }, 0)
      const hashSuffix = Math.abs(hash).toString(36).substring(0, 2).toUpperCase()
      
      const skuParts = sortedEntries.map(([key, value], partIndex) => {
        const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
        let code = ''
        
        if (cleanValue.length >= 4) {
          code = cleanValue.substring(0, 2) + cleanValue.substring(cleanValue.length - 2)
        } else if (cleanValue.length === 3) {
          code = cleanValue + key.charAt(0).toUpperCase()
        } else if (cleanValue.length === 2) {
          code = cleanValue + cleanValue.charAt(0) + key.charAt(0).toUpperCase()
        } else if (cleanValue.length === 1) {
          code = cleanValue + cleanValue + cleanValue + key.charAt(0).toUpperCase()
        } else {
          code = key.substring(0, 2).toUpperCase() + partIndex.toString()
        }
        return code
      })
      
      const skuSuffix = skuParts.join('-') + '-' + hashSuffix
      const base = (baseSKU || 'PROD').trim().toUpperCase()
      let finalSKU = `${base}-${skuSuffix}`
      
      let counter = 1
      while (usedSKUs.has(finalSKU)) {
        finalSKU = `${base}-${skuSuffix}-${counter}`
        counter++
      }
      
      return finalSKU
    }
    
    setVariants(prevVariants => {
      const generatedSKUs = new Set<string>()
      const generated = combinations.map((combo, index) => {
        const comboId = Object.values(combo).join('-').replace(/\s+/g, '-')

        const existing = prevVariants.find(v => {
          const vKeys = Object.keys(v.attributes).sort()
          const cKeys = Object.keys(combo).sort()
          return vKeys.length === cKeys.length &&
            vKeys.every(key => v.attributes[key] === combo[key])
        })

        if (existing) {
          // Si los atributos cambiaron, regenerar el SKU automáticamente
          const attributesChanged = Object.keys(combo).some(key => existing.attributes[key] !== combo[key]) ||
            Object.keys(existing.attributes).some(key => combo[key] !== existing.attributes[key])
          
          if (attributesChanged || !existing.sku || existing.sku.trim() === '' || existing.sku.startsWith(`${sku || 'PROD'}-`) === false) {
            const newSKU = generateVariantSKU(combo, sku, index, generatedSKUs)
            generatedSKUs.add(newSKU)
            return {
              ...existing,
              attributes: combo,
              sku: newSKU
            }
          }
          if (generatedSKUs.has(existing.sku)) {
            const newSKU = generateVariantSKU(combo, sku, index, generatedSKUs)
            generatedSKUs.add(newSKU)
            return {
              ...existing,
              attributes: combo,
              sku: newSKU
            }
          }
          generatedSKUs.add(existing.sku)
          return {
            ...existing,
            attributes: combo
          }
        }

        const newSKU = generateVariantSKU(combo, sku, index, generatedSKUs)
        generatedSKUs.add(newSKU)

        return {
          id: `${comboId}-${Date.now()}-${index}`,
          attributes: combo,
          precio: '0.00',
          sku: newSKU,
          stock: 0,
          activo: true
        }
      })

      const existingVariants = prevVariants.filter(v => {
        const comboExists = combinations.some(combo => {
          const vKeys = Object.keys(v.attributes).sort()
          const cKeys = Object.keys(combo).sort()
          return vKeys.length === cKeys.length &&
            vKeys.every(key => v.attributes[key] === combo[key])
        })
        return !comboExists
      })

      return [...generated, ...existingVariants]
    })
  }, [hasVariants, attributes, sku])

  // Función para actualizar variante
  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  // Función para aplicar el precio original a todas las variantes
  const applyPriceToAllVariants = () => {
    const precioNum = parseFloat(precio.replace(/[^0-9.]/g, ''))
    if (isNaN(precioNum) || precioNum <= 0) {
      return
    }
    const precioFormateado = precioNum.toFixed(2)
    setVariants(variants.map(v => ({ ...v, precio: precioFormateado })))
  }

  const addSpecification = () => {
    const nombre = prompt('Nombre de la especificación:')
    if (nombre) {
      const valor = prompt('Valor (opcional):') || ''
      setSpecifications([...specifications, { 
        id: Date.now().toString(), 
        name: nombre,
        valor: valor || undefined
      }])
    }
  }

  const updateSpecification = (id: string, field: 'name' | 'valor', value: string) => {
    setSpecifications(specifications.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter(s => s.id !== id))
  }

  // Función para guardar cambios
  const handleSave = async (estado?: 'Borrador' | 'Activo' | 'Inactivo') => {
    setErrors({})
    
    // Validar campos requeridos
    if (!nombre || !sku || !precio) {
      await showError('Campos requeridos', 'Por favor completa los campos requeridos: Nombre, SKU y Precio')
      return
    }

    // Validar categoría (OBLIGATORIA)
    if (!categoriaId || categoriaId.trim() === '') {
      setErrors({ categoria: 'La categoría es obligatoria' })
      await showError('Error de validación', 'La categoría es obligatoria')
      return
    }

    setSaving(true)
    try {
      const precioNum = parseFloat(precio.replace(/[^0-9.]/g, '')) || 0
      const descuentoNum = parseFloat(descuento) || 0
      const stockNum = parseInt(stock) || 0
      const precioOriginal = descuentoNum > 0 ? precioNum : undefined

      // Actualizar producto principal
      await actualizarProducto(id, {
        nombre,
        descripcion: descripcion || undefined,
        descripcion_corta: descripcionCorta || undefined,
        precio: precioNum,
        descuento: descuentoNum,
        precio_original: precioOriginal,
        stock: stockNum,
        categoria_id: categoriaId || undefined,
        tipo_producto: tipoProducto || undefined,
        estado: estado || productStatus,
        tiene_variantes: hasVariants,
        es_nuevo: esNuevo,
        es_best_seller: esBestSeller,
        es_oferta: esOferta
      })

      // Actualizar variantes si tiene variantes
      if (hasVariants && variants.length > 0) {
        const variantesData = variants.map(v => ({
          id: v.dbId, // Mantener ID de BD si existe
          atributos: v.attributes,
          precio: parseFloat(v.precio) || undefined,
          sku: v.sku,
          stock: v.stock,
          activo: v.activo,
          imagen_url: undefined
        }))
        await actualizarVariantesProducto(id, variantesData)
      } else if (!hasVariants) {
        // Si desactiva variantes, eliminar todas
        await actualizarVariantesProducto(id, [])
      }

      await showSuccess('Producto actualizado', 'El producto ha sido actualizado exitosamente')
      router.push('/productos')
    } catch (error: any) {
      console.error('Error actualizando producto:', error)
      await showError('Error al actualizar', error?.message || 'Error desconocido al actualizar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Cargando producto...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <h2>SOLHANA</h2>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.draftButton}
            onClick={() => handleSave('Borrador')}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button className={styles.previewButton} disabled>
            <EyeIcon size={18} />
          </button>
          <button 
            className={styles.publishButton}
            onClick={() => handleSave('Activo')}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Título y Descripción */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Editar producto</h1>
        <p className={styles.description}>
          Modifica los detalles del producto.
        </p>
      </div>

      {/* Contenido principal - Dos columnas */}
      <div className={styles.content}>
        {/* Columna izquierda */}
        <div className={styles.leftColumn}>
          {/* Información principal */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Información principal</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Título del producto <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Camiseta de algodón orgánico"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción corta</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Descripción breve para listados..."
                value={descripcionCorta}
                onChange={(e) => setDescripcionCorta(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción del producto</label>
              <textarea
                className={styles.textarea}
                rows={6}
                placeholder="Describe tu producto en detalle..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          {/* Precio */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Precio</h3>
            <div className={styles.priceRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Precio <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Bs. 0.00"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Descuento</label>
                <div className={styles.discountInput}>
                  <input
                    type="number"
                    className={styles.input}
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    min="0"
                    max="100"
                  />
                  <span className={styles.percent}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span>📦</span>
              Inventario
            </h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>SKU (Stock Keeping Unit) <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="CAM-ALG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cantidad disponible</label>
              <input
                type="number"
                className={styles.input}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Variantes del producto */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span>🎨</span>
              Variantes del producto
            </h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
                <span>Este producto tiene variantes (Tallas, colores, medidas...)</span>
              </label>
            </div>

            {hasVariants && (
              <>
                {errors.variantes && (
                  <div className={styles.errorBanner}>
                    <span className={styles.errorMessage}>{errors.variantes}</span>
                  </div>
                )}

                {/* Gestión de Atributos */}
                <div className={styles.variantSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label className={styles.label}>Atributos de Variante</label>
                    <button 
                      className={styles.addButton}
                      onClick={() => setShowAddAttributeModal(true)}
                      type="button"
                    >
                      <PlusIcon size={16} />
                      Agregar Atributo
                    </button>
                  </div>

                  {attributes.map((attr) => (
                    <div key={attr.id} className={styles.attributeCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label className={styles.label} style={{ margin: 0 }}>
                          {attr.name}
                        </label>
                        <button
                          className={styles.tagRemove}
                          onClick={() => removeAttribute(attr.id)}
                          type="button"
                        >
                          <XIcon size={18} />
                        </button>
                      </div>
                      <div className={styles.tagsContainer}>
                        {attr.values.map((value) => (
                          <span key={value} className={styles.tag}>
                            {value}
                            <button
                              className={styles.tagRemove}
                              onClick={() => removeAttributeValue(attr.id, value)}
                              type="button"
                            >
                              <XIcon size={14} />
                            </button>
                          </span>
                        ))}
                        <button 
                          className={styles.addTagButton} 
                          onClick={() => handleOpenAddValueModal(attr.id)}
                          type="button"
                        >
                          + Agregar valor
                        </button>
                      </div>
                    </div>
                  ))}

                  {attributes.length === 0 && (
                    <div style={{ 
                      padding: '24px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      border: '2px dashed #e5e7eb',
                      borderRadius: '8px'
                    }}>
                      <p style={{ margin: 0 }}>No hay atributos configurados</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                        Agrega atributos como Color, Talla, Material, etc.
                      </p>
                    </div>
                  )}
                </div>

                {variants.length > 0 && (
                  <div className={styles.variantsGenerated}>
                    <div className={styles.variantsHeader}>
                      <span className={styles.variantsCount}>{variants.length} variantes</span>
                      <div className={styles.variantsActions}>
                        <button 
                          className={styles.actionButton}
                          onClick={applyPriceToAllVariants}
                          title={`Aplicar precio de Bs. ${parseFloat(precio.replace(/[^0-9.]/g, '')) || 0} a todas las variantes`}
                        >
                          💰 Aplicar precio original
                        </button>
                      </div>
                    </div>
                    <div className={styles.variantsTable}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>VARIANTE</th>
                            <th>PRECIO</th>
                            <th>SKU</th>
                            <th>STOCK</th>
                            <th>ACTIVO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant, index) => (
                            <tr key={variant.id}>
                              <td>
                                {Object.entries(variant.attributes)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' / ')}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className={styles.input}
                                  style={{ width: '100px' }}
                                  value={variant.precio}
                                  onChange={(e) => updateVariant(variant.id, 'precio', e.target.value)}
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className={styles.input}
                                  style={{ width: '140px', backgroundColor: '#f9fafb' }}
                                  value={variant.sku}
                                  readOnly
                                  title="SKU generado automáticamente basado en los atributos"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className={styles.input}
                                  style={{ width: '100px' }}
                                  value={variant.stock}
                                  onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                  min="0"
                                />
                              </td>
                              <td>
                                <label className={styles.toggle}>
                                  <input
                                    type="checkbox"
                                    checked={variant.activo}
                                    onChange={(e) => updateVariant(variant.id, 'activo', e.target.checked)}
                                  />
                                  <span className={styles.toggleSlider}></span>
                                </label>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className={styles.rightColumn}>
          {/* Estado del producto */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span>⚡</span>
              Estado del producto
            </h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="Borrador"
                  checked={productStatus === 'Borrador'}
                  onChange={(e) => setProductStatus(e.target.value as 'Borrador')}
                />
                <span>Borrador</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="Activo"
                  checked={productStatus === 'Activo'}
                  onChange={(e) => setProductStatus(e.target.value as 'Activo')}
                />
                <span>Activo</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="Inactivo"
                  checked={productStatus === 'Inactivo'}
                  onChange={(e) => setProductStatus(e.target.value as 'Inactivo')}
                />
                <span>Inactivo</span>
              </label>
            </div>
          </div>

          {/* Organización */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span>🗂️</span>
              Organización
            </h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <p>Categoría <span style={{ color: '#ef4444' }}>*</span></p>
              </label>
              <select 
                className={`${styles.select} ${errors.categoria ? styles.inputError : ''}`}
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value)
                  if (errors.categoria) {
                    setErrors({ ...errors, categoria: '' })
                  }
                }}
                data-error={errors.categoria ? 'true' : undefined}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              {errors.categoria && <span className={styles.errorMessage}>{errors.categoria}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Producto</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Camiseta, Zapatillas, etc."
                value={tipoProducto}
                onChange={(e) => setTipoProducto(e.target.value)}
              />
            </div>
            <div className={styles.checkboxGroup} style={{ marginTop: '16px' }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={esNuevo}
                  onChange={(e) => setEsNuevo(e.target.checked)}
                />
                <span>Marcar como nuevo</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={esBestSeller}
                  onChange={(e) => setEsBestSeller(e.target.checked)}
                />
                <span>Best Seller</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={esOferta}
                  onChange={(e) => setEsOferta(e.target.checked)}
                />
                <span>En oferta</span>
              </label>
            </div>
          </div>

          {/* Especificaciones */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <span>📋</span>
                Especificaciones
              </h3>
              <button className={styles.newButton} onClick={addSpecification}>
                + Nueva
              </button>
            </div>
            <div className={styles.specificationsList}>
              {specifications.map((spec, index) => (
                <div key={spec.id} className={styles.specificationItem}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                      value={spec.name}
                      onChange={(e) => updateSpecification(spec.id, 'name', e.target.value)}
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      className={styles.input}
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                      value={spec.valor || ''}
                      onChange={(e) => updateSpecification(spec.id, 'valor', e.target.value)}
                      placeholder="Valor (opcional)"
                    />
                  </div>
                  <div className={styles.specActions}>
                    <button
                      className={styles.iconButton}
                      onClick={() => removeSpecification(spec.id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medios */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span>🖼️</span>
              Medios
            </h3>
            <ImageUploader
              images={imagenes}
              onImagesChange={setImagenes}
              maxImages={5}
              bucket="productos"
              folder="productos"
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <AddAttributeModal
        isOpen={showAddAttributeModal}
        onClose={() => setShowAddAttributeModal(false)}
        onAdd={addAttribute}
        existingAttributes={existingAttributeNames}
      />
      <AddValueModal
        isOpen={showAddValueModal}
        onClose={() => setShowAddValueModal(false)}
        onAdd={addAttributeValue}
        attributeName={attributes.find(a => a.id === selectedAttributeForValue)?.name || ''}
        existingValues={attributes.find(a => a.id === selectedAttributeForValue)?.values || []}
      />
    </div>
  )
}


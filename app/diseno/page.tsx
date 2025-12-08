'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadImage, validateImageFile } from '@/lib/supabase-storage'
import { showError, showSuccess } from '@/lib/swal'
import { 
  getBanners, 
  getSecciones, 
  guardarBanner, 
  guardarSeccion, 
  eliminarBanner,
  getCategoriasConImagenes,
  actualizarCategoriaImagen
} from '@/lib/supabase-queries'
import styles from './diseno.module.css'

interface Banner {
  id?: string
  imagen: string | null
  titulo: string
  subtitulo: string
  textoBoton: string
  urlEnlace: string
  orden: number
}

interface Section {
  id?: string
  name: string
  visible: boolean
  orden: number
  configuracion?: any
}

interface CategoriaSeleccionada {
  categoriaId: string
  categoriaNombre: string
  imagen: string | null
}

export default function DisenoPage() {
  const [bannerExpanded, setBannerExpanded] = useState(true)
  const [sectionsExpanded, setSectionsExpanded] = useState(true)
  const [banners, setBanners] = useState<Banner[]>([
    {
      imagen: null,
      titulo: 'Descubre Nuestra Nueva Colección',
      subtitulo: 'Explora las últimas tendencias y encuentra tus nuevas piezas favoritas.',
      textoBoton: 'Explorar Ahora',
      urlEnlace: '',
      orden: 0
    }
  ])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [sections, setSections] = useState<Section[]>([
    { name: 'Novedades', visible: true, orden: 1 },
    { name: 'Comprar por Categoría', visible: true, orden: 2 },
    { name: 'Nuestros Valores', visible: true, orden: 3 }
  ])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categorias, setCategorias] = useState<Array<{ id: string, nombre: string }>>([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<CategoriaSeleccionada[]>([])
  const [uploadingCategoriaIndex, setUploadingCategoriaIndex] = useState<number | null>(null)
  const categoriaFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Cargar datos desde la BD al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [bannersData, seccionesData] = await Promise.all([
          getBanners(),
          getSecciones()
        ])

        // Cargar banners
        if (bannersData && bannersData.length > 0) {
          const loadedBanners = bannersData.map((banner: any) => ({
            id: banner.id,
            imagen: banner.configuracion?.imagen || null,
            titulo: banner.configuracion?.titulo || '',
            subtitulo: banner.configuracion?.subtitulo || '',
            textoBoton: banner.configuracion?.textoBoton || '',
            urlEnlace: banner.url_enlace || '',
            orden: banner.orden || 0
          }))
          setBanners(loadedBanners)
        }

        // Cargar categorías disponibles
        const categoriasData = await getCategoriasConImagenes()
        setCategorias(categoriasData || [])

        // Cargar secciones
        if (seccionesData && seccionesData.length > 0) {
          const loadedSections = seccionesData.map((seccion: any) => {
            // Normalizar el nombre de la sección
            let sectionName = seccion.seccion
            // Convertir snake_case a formato legible
            if (sectionName.includes('_')) {
              sectionName = sectionName
                .split('_')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            } else {
              // Capitalizar primera letra
              sectionName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
            }
            
            // Mapear nombres comunes
            const nameMap: { [key: string]: string } = {
              'novedades': 'Novedades',
              'categorias': 'Comprar por Categoría',
              'categorías': 'Comprar por Categoría',
              'nuestros_valores': 'Nuestros Valores',
              'valores': 'Nuestros Valores'
            }
            const finalName = nameMap[seccion.seccion.toLowerCase()] || sectionName
            
            // Si es la sección de categorías, cargar las categorías seleccionadas
            if (finalName === 'Comprar por Categoría' && seccion.configuracion?.categorias) {
              // Cargar las categorías seleccionadas y sus imágenes desde la BD
              const categoriasConfig = seccion.configuracion.categorias || []
              const categoriasConImagenes = categoriasConfig.map((cat: any) => {
                // Buscar la categoría en la lista cargada para obtener su imagen_url
                const categoriaBD = categoriasData?.find((c: any) => c.id === cat.categoriaId)
                return {
                  categoriaId: cat.categoriaId,
                  categoriaNombre: cat.categoriaNombre || categoriaBD?.nombre || '',
                  imagen: cat.imagen || categoriaBD?.imagen_url || null
                }
              })
              setCategoriasSeleccionadas(categoriasConImagenes)
            }
            
            return {
              id: seccion.id,
              name: finalName,
              visible: seccion.visible !== undefined ? seccion.visible : true,
              orden: seccion.orden || 0,
              configuracion: seccion.configuracion
            }
          })
          setSections(loadedSections)
        } else {
          // Si no hay secciones en BD, usar las por defecto
          setSections([
            { name: 'Novedades', visible: true, orden: 1 },
            { name: 'Comprar por Categoría', visible: true, orden: 2 },
            { name: 'Nuestros Valores', visible: true, orden: 3 }
          ])
        }
      } catch (error: any) {
        console.error('Error cargando datos:', error)
        await showError('Error', 'No se pudieron cargar los datos del diseño')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentBanner = banners[currentBannerIndex] || banners[0]

  const toggleSectionVisibility = (index: number) => {
    setSections(sections.map((section, i) =>
      i === index ? { ...section, visible: !section.visible } : section
    ))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    const validation = validateImageFile(file)
    if (!validation.valid) {
      await showError('Error de validación', validation.error || 'Archivo inválido')
      return
    }

    setUploading(true)
    try {
      const url = await uploadImage(file, 'productos', 'banners')
      const updatedBanners = [...banners]
      updatedBanners[currentBannerIndex] = {
        ...updatedBanners[currentBannerIndex],
        imagen: url
      }
      setBanners(updatedBanners)
      await showSuccess('Imagen subida', 'La imagen del banner se ha subido exitosamente')
    } catch (error: any) {
      console.error('Error subiendo imagen:', error)
      await showError('Error al subir', error.message || 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    const updatedBanners = [...banners]
    updatedBanners[currentBannerIndex] = {
      ...updatedBanners[currentBannerIndex],
      imagen: null
    }
    setBanners(updatedBanners)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    const validation = validateImageFile(file)
    if (!validation.valid) {
      await showError('Error de validación', validation.error || 'Archivo inválido')
      return
    }

    setUploading(true)
    try {
      const url = await uploadImage(file, 'productos', 'banners')
      const updatedBanners = [...banners]
      updatedBanners[currentBannerIndex] = {
        ...updatedBanners[currentBannerIndex],
        imagen: url
      }
      setBanners(updatedBanners)
      await showSuccess('Imagen subida', 'La imagen del banner se ha subido exitosamente')
    } catch (error: any) {
      console.error('Error subiendo imagen:', error)
      await showError('Error al subir', error.message || 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleAddBanner = () => {
    setBanners([...banners, {
      imagen: null,
      titulo: 'Nuevo Banner',
      subtitulo: 'Descripción del banner',
      textoBoton: 'Explorar',
      urlEnlace: '',
      orden: banners.length
    }])
    setCurrentBannerIndex(banners.length)
  }

  const handleDeleteBanner = async (index: number) => {
    if (banners.length <= 1) {
      await showError('Error', 'Debe haber al menos un banner')
      return
    }

    const banner = banners[index]
    if (banner.id) {
      try {
        await eliminarBanner(banner.id)
      } catch (error) {
        console.error('Error eliminando banner:', error)
      }
    }

    const newBanners = banners.filter((_, i) => i !== index)
    setBanners(newBanners)
    if (currentBannerIndex >= newBanners.length) {
      setCurrentBannerIndex(newBanners.length - 1)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Primero, eliminar banners que ya no existen en el estado actual
      const existingBannerIds = banners.filter(b => b.id).map(b => b.id)
      if (existingBannerIds.length > 0) {
        // Obtener todos los banners actuales de la BD
        const allBanners = await getBanners()
        const bannersToDelete = allBanners?.filter((b: any) => 
          b.id && !existingBannerIds.includes(b.id)
        ) || []
        
        // Eliminar banners que ya no están en el estado
        for (const bannerToDelete of bannersToDelete) {
          try {
            await eliminarBanner(bannerToDelete.id)
          } catch (error) {
            console.error('Error eliminando banner:', error)
          }
        }
      }

      // Obtener todos los banners actuales de la BD para mantener sus secciones
      const allBanners = await getBanners()
      const bannersMap = new Map(allBanners?.map((b: any) => [b.id, b]) || [])

      // Guardar banners y actualizar IDs
      const updatedBanners = [...banners]
      for (let i = 0; i < banners.length; i++) {
        const banner = banners[i]
        
        // Mantener el seccion original si el banner ya existe, o generar uno único basado en el ID
        let seccionValue: string
        if (banner.id && bannersMap.has(banner.id)) {
          // Si el banner ya existe, mantener su seccion original
          seccionValue = bannersMap.get(banner.id).seccion
        } else if (banner.id) {
          // Si tiene ID pero no está en la BD, usar el ID como base
          seccionValue = `banner_${banner.id}`
        } else {
          // Para banners nuevos, generar un identificador único temporal
          seccionValue = `banner_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        
        const savedBanner = await guardarBanner({
          id: banner.id,
          seccion: seccionValue,
          configuracion: {
            imagen: banner.imagen,
            titulo: banner.titulo,
            subtitulo: banner.subtitulo,
            textoBoton: banner.textoBoton
          },
          url_enlace: banner.urlEnlace || undefined,
          visible: true,
          orden: i
        })
        
        // Actualizar el ID del banner en el estado local y actualizar el mapa
        if (savedBanner && savedBanner.id) {
          updatedBanners[i] = {
            ...updatedBanners[i],
            id: savedBanner.id,
            orden: savedBanner.orden || i
          }
          // Actualizar el mapa con el banner guardado
          bannersMap.set(savedBanner.id, savedBanner)
        }
      }
      setBanners(updatedBanners)

      // Guardar secciones y actualizar IDs
      const updatedSections = [...sections]
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        // Mapear nombres legibles a identificadores de sección
        const sectionMap: { [key: string]: string } = {
          'Novedades': 'novedades',
          'Comprar por Categoría': 'categorias',
          'Comprar Por Categoría': 'categorias',
          'Nuestros Valores': 'nuestros_valores'
        }
        const sectionId = sectionMap[section.name] || section.name.toLowerCase().replace(/\s+/g, '_')
        
        // Si es la sección de categorías, incluir las categorías seleccionadas
        let configuracion: any = {
          titulo: section.name,
          mostrar: section.visible
        }
        
        if (section.name === 'Comprar por Categoría' || section.name === 'Comprar Por Categoría') {
          configuracion.categorias = categoriasSeleccionadas
        }
        
        const savedSection = await guardarSeccion({
          id: section.id,
          seccion: sectionId,
          configuracion: configuracion,
          visible: section.visible,
          orden: section.orden || i + 1
        })
        
        // Actualizar el ID de la sección en el estado local
        if (savedSection && savedSection.id) {
          updatedSections[i] = {
            ...updatedSections[i],
            id: savedSection.id
          }
        }
      }
      setSections(updatedSections)

      await showSuccess('Guardado', 'Los cambios se han guardado exitosamente')
    } catch (error: any) {
      console.error('Error guardando:', error)
      await showError('Error', error.message || 'No se pudieron guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const updateCurrentBanner = (field: keyof Banner, value: any) => {
    const updatedBanners = [...banners]
    updatedBanners[currentBannerIndex] = {
      ...updatedBanners[currentBannerIndex],
      [field]: value
    }
    setBanners(updatedBanners)
  }

  // Estado para modal de selección de categoría
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)

  // Funciones para manejar categorías
  const handleCategoriaSlotClick = (slotIndex: number) => {
    const categoria = categoriasSeleccionadas[slotIndex]
    
    // Si ya tiene categoría, permitir cambiar imagen o categoría
    if (categoria && categoria.categoriaId) {
      // Mostrar opciones: cambiar categoría o cambiar imagen
      const cambiarCategoria = window.confirm('¿Deseas cambiar la categoría? (Cancelar para cambiar solo la imagen)')
      if (cambiarCategoria) {
        setSelectedSlotIndex(slotIndex)
        setShowCategoriaModal(true)
      } else {
        // Cambiar solo la imagen
        const input = categoriaFileInputRefs.current[`categoria-${slotIndex}`]
        if (input) {
          input.click()
        }
      }
    } else {
      // No tiene categoría, abrir modal para seleccionar
      setSelectedSlotIndex(slotIndex)
      setShowCategoriaModal(true)
    }
  }

  const seleccionarCategoria = (categoriaId: string) => {
    if (selectedSlotIndex === null) return
    
    const categoria = categorias.find(c => c.id === categoriaId)
    if (!categoria) return

    const updated = [...categoriasSeleccionadas]
    
    // Cargar la imagen de la categoría si existe en la BD
    const imagenCategoria = (categoria as any).imagen_url || null
    
    // Si ya existe una categoría en ese slot, reemplazarla
    if (updated[selectedSlotIndex]) {
      updated[selectedSlotIndex] = {
        categoriaId: categoria.id,
        categoriaNombre: categoria.nombre,
        imagen: updated[selectedSlotIndex].imagen || imagenCategoria // Mantener imagen existente o cargar de BD
      }
    } else {
      // Agregar nueva categoría
      updated[selectedSlotIndex] = {
        categoriaId: categoria.id,
        categoriaNombre: categoria.nombre,
        imagen: imagenCategoria // Cargar imagen de la BD si existe
      }
    }
    
    setCategoriasSeleccionadas(updated)
    setShowCategoriaModal(false)
    setSelectedSlotIndex(null)
  }

  const eliminarCategoria = (index: number) => {
    const updated = [...categoriasSeleccionadas]
    updated[index] = {
      categoriaId: '',
      categoriaNombre: '',
      imagen: null
    }
    // Filtrar las vacías
    setCategoriasSeleccionadas(updated.filter(c => c.categoriaId))
  }

  const handleCategoriaImageUpload = async (index: number, file: File) => {
    try {
      if (!categoriasSeleccionadas[index] || !categoriasSeleccionadas[index].categoriaId) {
        await showError('Error', 'Primero debes seleccionar una categoría')
        return
      }
      
      setUploadingCategoriaIndex(index)
      const imageUrl = await uploadImage(file, 'categorias')
      const updated = [...categoriasSeleccionadas]
      updated[index] = {
        ...updated[index],
        imagen: imageUrl
      }
      setCategoriasSeleccionadas(updated)
      
      // Guardar en la base de datos
      await actualizarCategoriaImagen(categoriasSeleccionadas[index].categoriaId, {
        imagen_url: imageUrl
      })
    } catch (error: any) {
      await showError('Error', error.message || 'No se pudo subir la imagen')
    } finally {
      setUploadingCategoriaIndex(null)
    }
  }

  const handleCategoriaFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (validateImageFile(file)) {
        handleCategoriaImageUpload(index, file)
      }
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.title}>Diseño de Página de Inicio</h2>
        <div className={styles.headerActions}>
          <button className={styles.viewStoreButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
            <span>Ver Tienda</span>
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button className={styles.darkModeButton} id="theme-toggle">
            <span className="material-symbols-outlined dark:hidden" style={{ fontSize: '20px' }}>dark_mode</span>
            <span className="material-symbols-outlined hidden dark:inline" style={{ fontSize: '20px' }}>light_mode</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Panel - Editing */}
        <div className={styles.editingPanel}>
          {/* Banner Principal Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Banner Principal</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleAddBanner}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--primary)', 
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Agregar banner"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                </button>
            <button
              onClick={() => setBannerExpanded(!bannerExpanded)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', padding: 0 }}
            >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {bannerExpanded ? 'expand_less' : 'expand_more'}
                  </span>
            </button>
              </div>
            </div>
            {bannerExpanded && (
              <div className={styles.sectionContent}>
                {/* Selector de banner */}
                {banners.length > 1 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label className={styles.label}>Banner actual ({currentBannerIndex + 1} de {banners.length})</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                      <select
                        className={styles.input}
                        value={currentBannerIndex}
                        onChange={(e) => setCurrentBannerIndex(Number(e.target.value))}
                        style={{ flex: 1 }}
                      >
                        {banners.map((_, index) => (
                          <option key={index} value={index}>
                            Banner {index + 1}
                          </option>
                        ))}
                      </select>
                      {banners.length > 1 && (
                        <button
                          onClick={() => handleDeleteBanner(currentBannerIndex)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Eliminar banner"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className={styles.label} htmlFor="file-upload">Imagen de fondo</label>
                <div 
                  className={styles.uploadArea}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                    style={{ cursor: 'pointer', marginTop: '4px' }}
                >
                    {currentBanner.imagen ? (
                    <div className={styles.imagePreview}>
                        <img src={currentBanner.imagen} alt="Banner" className={styles.previewImage} />
                      <button
                        type="button"
                        className={styles.removeImageButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage()
                        }}
                      >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      {uploading ? (
                        <div className={styles.uploadingText}>Subiendo imagen...</div>
                      ) : (
                        <>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--slate-400)', marginBottom: '8px' }}>image</span>
                          <div className={styles.uploadText}>
                              <label htmlFor="file-upload" className={styles.uploadLink} style={{ cursor: 'pointer' }}>
                                Subir un archivo
                              </label>
                            <span> o arrastrar y soltar</span>
                          </div>
                            <p className={styles.uploadHint}>
                              PNG, JPG, GIF hasta 10MB
                            </p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="banner-title">Título</label>
                  <input
                    id="banner-title"
                    type="text"
                    className={styles.input}
                    value={currentBanner.titulo}
                    onChange={(e) => updateCurrentBanner('titulo', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="banner-subtitle">Subtítulo</label>
                  <input
                    id="banner-subtitle"
                    type="text"
                    className={styles.input}
                    value={currentBanner.subtitulo}
                    onChange={(e) => updateCurrentBanner('subtitulo', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="banner-button">Texto del botón</label>
                  <input
                    id="banner-button"
                    type="text"
                    className={styles.input}
                    value={currentBanner.textoBoton}
                    onChange={(e) => updateCurrentBanner('textoBoton', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="banner-url">URL de enlace (opcional)</label>
                  <input
                    id="banner-url"
                    type="text"
                    className={styles.input}
                    placeholder="https://..."
                    value={currentBanner.urlEnlace}
                    onChange={(e) => updateCurrentBanner('urlEnlace', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Organizar Secciones Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Organizar Secciones</h3>
            <button
              onClick={() => setSectionsExpanded(!sectionsExpanded)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', padding: 0 }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {sectionsExpanded ? 'expand_less' : 'expand_more'}
                </span>
            </button>
            </div>
            {sectionsExpanded && (
              <div className={styles.sectionContent}>
                {sections.map((section, index) => (
                  <div key={index} className={styles.sectionItem}>
                    <div className={styles.sectionItemLeft}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--slate-500)' }}>drag_indicator</span>
                      <span className={styles.sectionItemName}>{section.name}</span>
                    </div>
                    <button
                      className={styles.visibilityButton}
                      onClick={() => toggleSectionVisibility(index)}
                      title={section.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {section.visible ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configurar Categorías Section - Solo si la sección está visible */}
          {sections.find(s => (s.name === 'Comprar por Categoría' || s.name === 'Comprar Por Categoría') && s.visible) && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle} style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Selección de Categorías
                </h3>
              </div>
              <div className={styles.sectionContent}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '16px',
                  marginTop: '16px'
                }}>
                  {/* Mostrar hasta 2 categorías seleccionadas */}
                  {[0, 1].map((slotIndex) => {
                    const categoria = categoriasSeleccionadas[slotIndex]
                    return (
                      <div key={slotIndex}>
                        {categoria ? (
                          <div
                            onClick={() => handleCategoriaSlotClick(slotIndex)}
                            style={{
                              position: 'relative',
                              aspectRatio: '4/3',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '2px dashed var(--slate-300)',
                              backgroundColor: categoria.imagen ? 'transparent' : 'var(--slate-50)',
                              backgroundImage: categoria.imagen ? `url(${categoria.imagen})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--primary)'
                              e.currentTarget.style.transform = 'scale(1.02)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--slate-300)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            {categoria.imagen && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)'
                              }}></div>
                            )}
                            {uploadingCategoriaIndex === slotIndex && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                              }}>
                                <span style={{ color: 'white', fontWeight: 500 }}>Subiendo...</span>
                              </div>
                            )}
                            {!categoria.imagen && (
                              <span className="material-symbols-outlined" style={{ 
                                fontSize: '48px', 
                                color: 'var(--slate-400)',
                                marginBottom: '8px'
                              }}>add</span>
                            )}
                            <span style={{
                              fontSize: '14px',
                              color: categoria.imagen ? 'white' : 'var(--slate-600)',
                              fontWeight: 500,
                              position: 'relative',
                              zIndex: 5,
                              textAlign: 'center',
                              padding: '0 12px'
                            }}>
                              {categoria.categoriaNombre || 'Buscar categorias'}
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleCategoriaSlotClick(slotIndex)}
                            style={{
                              aspectRatio: '4/3',
                              borderRadius: '12px',
                              border: '2px dashed var(--slate-300)',
                              backgroundColor: 'var(--white)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--primary)'
                              e.currentTarget.style.backgroundColor = 'var(--slate-50)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--slate-300)'
                              e.currentTarget.style.backgroundColor = 'var(--white)'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ 
                              fontSize: '48px', 
                              color: 'var(--slate-400)',
                              marginBottom: '8px'
                            }}>add</span>
                            <span style={{
                              fontSize: '14px',
                              color: 'var(--slate-600)',
                              fontWeight: 500
                            }}>
                              Buscar categorias
                            </span>
                          </div>
                        )}
                        <input
                          ref={(el) => { categoriaFileInputRefs.current[`categoria-${slotIndex}`] = el }}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={(e) => handleCategoriaFileSelect(slotIndex, e)}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.browserWindow}>
            <div className={styles.browserHeader}>
              <div className={styles.browserControls}>
                <span className={styles.browserDot} style={{ backgroundColor: '#ef4444' }}></span>
                <span className={styles.browserDot} style={{ backgroundColor: '#facc15' }}></span>
                <span className={styles.browserDot} style={{ backgroundColor: '#22c55e' }}></span>
              </div>
              <div className={styles.browserAddressBar}>
                www.solhana.com
              </div>
              <div className={styles.browserSpacer}></div>
            </div>
            <div className={styles.websitePreview}>
              {/* Website Header */}
              <header className={styles.websiteHeader}>
                <div className={styles.websiteLogo}>
                  <div className={styles.logoCircle}></div>
                  <span className={styles.logoText}>SOLHANA</span>
                </div>
                <nav className={styles.websiteNav}>
                  <a href="#">Tienda</a>
                  <a href="#">Categorías</a>
                  <a href="#">Sobre Nosotros</a>
                </nav>
                <div className={styles.websiteActions}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_outline</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_bag</span>
                </div>
              </header>

              {/* Main Banner - Carrusel */}
              <section 
                className={styles.bannerPreview}
                style={{
                  backgroundImage: currentBanner.imagen ? `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%), url(${currentBanner.imagen})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  minHeight: '380px'
                }}
              >
                {!currentBanner.imagen && <div className={styles.bannerOverlay}></div>}
                <div className={styles.bannerContent}>
                  <h1 className={styles.bannerTitle}>{currentBanner.titulo}</h1>
                  <p className={styles.bannerSubtitle}>{currentBanner.subtitulo}</p>
                  <button className={styles.bannerButton}>
                    {currentBanner.textoBoton}
                  </button>
                </div>
                {banners.length > 1 && (
                  <>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '16px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          style={{
                            width: index === currentBannerIndex ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: index === currentBannerIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentBannerIndex((prev) => (prev > 0 ? prev - 1 : banners.length - 1))}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
                    </button>
                    <button
                      onClick={() => setCurrentBannerIndex((prev) => (prev < banners.length - 1 ? prev + 1 : 0))}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_forward_ios</span>
                    </button>
                  </>
                )}
              </section>

              {/* Secciones dinámicas */}
              {sections
                .filter(section => section.visible)
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((section, index) => {
                  if (section.name === 'Novedades') {
                    return (
                      <section key={index} className={styles.novedadesSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 className={styles.sectionHeading}>Explorar</h2>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              border: '1px solid var(--border-light)', 
                              background: 'var(--card-light)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                            </button>
                            <button style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              border: '1px solid var(--border-light)', 
                              background: 'var(--card-light)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                            </button>
                </div>
              </div>
                        <div className={styles.productsGrid} style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                          {/* Productos de ejemplo */}
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={styles.productCard} style={{ minWidth: '256px', flexShrink: 0 }}>
                              <div className={styles.productImage} style={{ backgroundColor: 'var(--slate-200)', aspectRatio: '1', borderRadius: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '48px' }}>📦</span>
                              </div>
                              <div style={{ padding: '12px 0' }}>
                                <h3 style={{ fontWeight: 600, margin: '0 0 4px 0', fontSize: '16px', color: 'var(--slate-900)' }}>Producto {i}</h3>
                                <p style={{ color: 'var(--slate-500)', margin: '0 0 12px 0', fontSize: '14px' }}>$29.99</p>
                                <button style={{ width: '100%', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '9px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, background: 'rgba(19, 127, 236, 0.1)', cursor: 'pointer' }}>
                                  Añadir al Carrito
                                </button>
                    </div>
                    </div>
                          ))}
                    </div>
                      </section>
                    )
                  } else if (section.name === 'Comprar por Categoría' || section.name === 'Comprar Por Categoría') {
                    return (
                      <section key={index} className={styles.novedadesSection} style={{ marginTop: '48px' }}>
                        <h2 className={styles.sectionHeading}>Comprar por Categoría</h2>
                        <div className={styles.productsGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          {categoriasSeleccionadas.length > 0 ? (
                            categoriasSeleccionadas.map((cat, catIndex) => (
                              <div key={catIndex} style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: 'var(--slate-200)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: cat.imagen ? `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%), url(${cat.imagen})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}>
                                {!cat.imagen && (
                                  <div style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    backgroundColor: 'rgba(0,0,0,0.4)' 
                                  }}></div>
                                )}
                                <div style={{ 
                                  position: 'relative', 
                                  zIndex: 10, 
                                  color: 'white', 
                                  textAlign: 'center' 
                                }}>
                                  <h3 style={{ fontSize: '30px', fontWeight: 700, margin: '0 0 12px 0' }}>
                                    {cat.categoriaNombre}
                                  </h3>
                                  <a href="#" style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '4px',
                                    color: 'white'
                                  }}>
                                    Comprar Ahora
                                  </a>
                                </div>
                              </div>
                            ))
                          ) : (
                            [1, 2].map((i) => (
                              <div key={i} style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: 'var(--slate-200)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <div style={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  backgroundColor: 'rgba(0,0,0,0.4)' 
                                }}></div>
                                <div style={{ 
                                  position: 'relative', 
                                  zIndex: 10, 
                                  color: 'white', 
                                  textAlign: 'center' 
                                }}>
                                  <h3 style={{ fontSize: '30px', fontWeight: 700, margin: '0 0 12px 0' }}>
                                    Agregar imagen
                                  </h3>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </section>
                    )
                  } else if (section.name === 'Nuestros Valores') {
                    return (
                      <section key={index} className={styles.novedadesSection} style={{ marginTop: '48px' }}>
                        <div style={{ 
                          backgroundColor: 'var(--card-light)', 
                          borderRadius: '12px', 
                          padding: '40px 24px',
                          marginTop: '48px'
                        }}>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '24px', 
                            textAlign: 'center' 
                          }}>
                            {[
                              { icon: 'local_shipping', title: 'Envío Gratis', desc: 'En todos los pedidos superiores a $50. Enviamos a cualquier parte del país.' },
                              { icon: 'eco', title: 'Materiales Sostenibles', desc: 'Elaborado con materiales ecológicos para un planeta mejor.' },
                              { icon: 'support_agent', title: 'Soporte 24/7', desc: 'Nuestro equipo está aquí para ayudarte con cualquier pregunta o inquietud.' }
                            ].map((valor, idx) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  backgroundColor: 'rgba(19, 127, 236, 0.1)', 
                                  color: 'var(--primary)',
                                  marginBottom: '8px'
                                }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{valor.icon}</span>
                                </div>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--slate-900)' }}>
                                  {valor.title}
                                </h4>
                                <p style={{ fontSize: '14px', color: 'var(--slate-500)', margin: 0, maxWidth: '200px' }}>
                                  {valor.desc}
                                </p>
                              </div>
                            ))}
                  </div>
                </div>
                      </section>
                    )
                  }
                  return null
                })}
            </div>
          </div>
                </div>
              </div>

      {/* Modal para seleccionar categoría */}
      {showCategoriaModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => {
          setShowCategoriaModal(false)
          setSelectedSlotIndex(null)
        }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>
                Seleccionar Categoría
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-500)', margin: 0 }}>
                Elige una categoría para mostrar en este espacio
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ marginBottom: '8px', display: 'block' }}>
                Categorías disponibles
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
                {categorias.map(cat => {
                  const yaSeleccionada = categoriasSeleccionadas.some(c => c.categoriaId === cat.id && c.categoriaId !== categoriasSeleccionadas[selectedSlotIndex || -1]?.categoriaId)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => seleccionarCategoria(cat.id)}
                      disabled={yaSeleccionada}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid var(--slate-200)',
                        borderRadius: '8px',
                        backgroundColor: yaSeleccionada ? 'var(--slate-100)' : 'white',
                        cursor: yaSeleccionada ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        opacity: yaSeleccionada ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!yaSeleccionada) {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.backgroundColor = 'var(--slate-50)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!yaSeleccionada) {
                          e.currentTarget.style.borderColor = 'var(--slate-200)'
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{cat.nombre}</span>
                        {yaSeleccionada && (
                          <span style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Ya seleccionada</span>
                        )}
                    </div>
                    </button>
                  )
                })}
                    </div>
                    </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCategoriaModal(false)
                  setSelectedSlotIndex(null)
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--slate-200)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancelar
              </button>
                    </div>
                  </div>
                </div>
              )}
    </div>
  )
}

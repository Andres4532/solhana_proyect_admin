'use client'

import { useState, useRef } from 'react'
import { uploadImage, validateImageFile } from '@/lib/supabase-storage'
import { showError } from '@/lib/swal'
import styles from './ImageUploader.module.css'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (urls: string[]) => void
  maxImages?: number
  bucket?: string
  folder?: string
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  bucket = 'productos',
  folder
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      await showError(
        'Demasiadas imágenes',
        `Solo puedes subir hasta ${maxImages} imágenes. Ya tienes ${images.length}.`
      )
      return
    }

    setUploading(true)

    try {
      const newUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validar archivo
        const validation = validateImageFile(file)
        if (!validation.valid) {
          await showError('Error de validación', validation.error || 'Archivo inválido')
          continue
        }

        // Subir imagen
        const url = await uploadImage(file, bucket, folder)
        newUrls.push(url)
      }

      onImagesChange([...images, ...newUrls])
    } catch (error: any) {
      console.error('Error subiendo imágenes:', error)
      await showError('Error al subir', error.message || 'No se pudieron subir las imágenes')
    } finally {
      setUploading(false)
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleClick = () => {
    if (images.length < maxImages && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageGrid}>
        {images.map((url, index) => (
          <div key={index} className={styles.imageItem}>
            <img src={url} alt={`Imagen ${index + 1}`} className={styles.image} />
            <div className={styles.imageItemOverlay}>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveImage(index)}
                disabled={uploading}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className={`${styles.uploadPlaceholder} ${uploading ? styles.uploading : ''}`}
            onClick={handleClick}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>add_photo_alternate</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <p className={styles.hint}>
          La primera imagen será la imagen principal del producto.
          {images.length < maxImages && ` Puedes agregar hasta ${maxImages - images.length} más.`}
        </p>
      )}
    </div>
  )
}


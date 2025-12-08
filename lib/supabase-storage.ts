import { supabase } from './supabase'

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo de imagen a subir
 * @param bucket - Nombre del bucket (por defecto 'productos')
 * @param folder - Carpeta dentro del bucket (opcional)
 * @returns URL pública de la imagen subida
 */
export async function uploadImage(
  file: File,
  bucket: string = 'productos',
  folder?: string
): Promise<string> {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error subiendo imagen:', error)
      throw error
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error: any) {
    console.error('Error en uploadImage:', error)
    throw new Error(`Error al subir imagen: ${error.message}`)
  }
}

/**
 * Sube múltiples imágenes
 * @param files - Array de archivos a subir
 * @param bucket - Nombre del bucket
 * @param folder - Carpeta dentro del bucket
 * @returns Array de URLs públicas
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'productos',
  folder?: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket, folder))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error: any) {
    console.error('Error subiendo múltiples imágenes:', error)
    throw error
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param filePath - Ruta del archivo a eliminar (ej: 'productos/imagen.jpg')
 * @param bucket - Nombre del bucket
 */
export async function deleteImage(
  filePath: string,
  bucket: string = 'productos'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Error eliminando imagen:', error)
      throw error
    }
  } catch (error: any) {
    console.error('Error en deleteImage:', error)
    throw new Error(`Error al eliminar imagen: ${error.message}`)
  }
}

/**
 * Obtiene la URL pública de una imagen
 * @param filePath - Ruta del archivo
 * @param bucket - Nombre del bucket
 * @returns URL pública
 */
export function getImageUrl(
  filePath: string,
  bucket: string = 'productos'
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Valida que el archivo sea una imagen
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
    }
  }

  return { valid: true }
}


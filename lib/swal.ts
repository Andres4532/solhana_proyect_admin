import Swal from 'sweetalert2'

// Helper para alertas de éxito
export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'Aceptar'
  })
}

// Helper para alertas de error
export const showError = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Aceptar'
  })
}

// Helper para confirmaciones
export const showConfirm = (
  title: string,
  message: string,
  confirmText: string = 'Sí, eliminar',
  cancelText: string = 'Cancelar'
) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  })
}

// Helper para alertas de información
export const showInfo = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'Aceptar'
  })
}

// Helper para loading
export const showLoading = (title: string = 'Cargando...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

// Helper para cerrar loading
export const closeLoading = () => {
  Swal.close()
}


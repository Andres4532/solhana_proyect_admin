'use client'

import { useState, useMemo } from 'react'
import Modal from './Modal'
import { getAttributeOptions, hasPredefinedOptions } from '@/lib/attributeOptions'
import styles from './AddAttributeModal.module.css'
import valueModalStyles from './AddValueModal.module.css'

interface AddValueModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (value: string) => void
  attributeName: string
  existingValues?: string[] // Valores que ya están agregados
}

export default function AddValueModal({ isOpen, onClose, onAdd, attributeName, existingValues = [] }: AddValueModalProps) {
  const [value, setValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const predefinedOptions = useMemo(() => getAttributeOptions(attributeName), [attributeName])
  const hasOptions = hasPredefinedOptions(attributeName)

  // Filtrar opciones disponibles (excluir las que ya están agregadas)
  const availableOptions = useMemo(() => {
    if (!hasOptions) return []
    return predefinedOptions.filter(opt => !existingValues.includes(opt))
  }, [predefinedOptions, existingValues, hasOptions])

  // Filtrar opciones por búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return availableOptions
    return availableOptions.filter(opt => 
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [availableOptions, searchTerm])

  const handleSelectOption = (option: string) => {
    onAdd(option)
    setValue('')
    setSearchTerm('')
    setError('')
    setUseCustom(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value.trim()) {
      setError('El valor es requerido')
      return
    }

    if (value.trim().length < 1) {
      setError('El valor debe tener al menos 1 carácter')
      return
    }

    if (value.trim().length > 50) {
      setError('El valor no puede exceder 50 caracteres')
      return
    }

    if (existingValues.includes(value.trim())) {
      setError('Este valor ya está agregado')
      return
    }

    onAdd(value.trim())
    setValue('')
    setSearchTerm('')
    setError('')
    setUseCustom(false)
    onClose()
  }

  const handleClose = () => {
    setValue('')
    setSearchTerm('')
    setError('')
    setUseCustom(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Agregar valor para "${attributeName}"`}
      size="medium"
    >
      <div className={styles.form}>
        {hasOptions && !useCustom ? (
          <>
            <div className={valueModalStyles.searchContainer}>
              <input
                type="text"
                className={valueModalStyles.searchInput}
                placeholder="Buscar opción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {filteredOptions.length > 0 ? (
              <div className={valueModalStyles.optionsGrid}>
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={valueModalStyles.optionButton}
                    onClick={() => handleSelectOption(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className={valueModalStyles.emptyState}>
                <p>No hay más opciones disponibles</p>
                <p className={valueModalStyles.emptySubtext}>
                  {availableOptions.length === 0 
                    ? 'Todas las opciones predefinidas ya están agregadas'
                    : 'No se encontraron opciones con ese término'}
                </p>
              </div>
            )}

            <div className={valueModalStyles.customOption}>
              <button
                type="button"
                className={valueModalStyles.customButton}
                onClick={() => setUseCustom(true)}
              >
                + Agregar valor personalizado
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Valor personalizado <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder="Ingresa un valor personalizado"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError('')
                }}
                autoFocus
              />
              {error && <span className={styles.errorMessage}>{error}</span>}
              <small className={styles.helpText}>
                Ingresa un valor que no esté en las opciones predefinidas
              </small>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  if (hasOptions) {
                    setUseCustom(false)
                    setValue('')
                    setError('')
                  } else {
                    handleClose()
                  }
                }}
              >
                {hasOptions ? 'Ver opciones' : 'Cancelar'}
              </button>
              <button
                type="submit"
                className={styles.submitButton}
              >
                Agregar
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}


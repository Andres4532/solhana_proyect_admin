'use client'

import { useState } from 'react'
import Modal from './Modal'
import { attributeNames } from '@/lib/attributeOptions'
import styles from './AddAttributeModal.module.css'

interface AddAttributeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string) => void
  existingAttributes?: string[] // Atributos que ya están agregados
}

export default function AddAttributeModal({ isOpen, onClose, onAdd, existingAttributes = [] }: AddAttributeModalProps) {
  const [selectedAttribute, setSelectedAttribute] = useState('')
  const [error, setError] = useState('')

  // Filtrar atributos disponibles (excluir los que ya están agregados)
  const availableAttributes = attributeNames.filter(name => !existingAttributes.includes(name))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAttribute) {
      setError('Debes seleccionar un atributo')
      return
    }

    onAdd(selectedAttribute)
    setSelectedAttribute('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setSelectedAttribute('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Atributo"
      size="small"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Seleccionar atributo <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${error ? styles.inputError : ''}`}
            value={selectedAttribute}
            onChange={(e) => {
              setSelectedAttribute(e.target.value)
              if (error) setError('')
            }}
            autoFocus
          >
            <option value="">Selecciona un atributo...</option>
            {availableAttributes.map((attrName) => (
              <option key={attrName} value={attrName}>
                {attrName}
              </option>
            ))}
          </select>
          {error && <span className={styles.errorMessage}>{error}</span>}
          {availableAttributes.length === 0 && (
            <small className={styles.helpText} style={{ color: '#ef4444' }}>
              Todos los atributos disponibles ya están agregados
            </small>
          )}
          {availableAttributes.length > 0 && (
            <small className={styles.helpText}>
              Selecciona un atributo de la lista. Los valores se agregarán desde opciones predefinidas.
            </small>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={availableAttributes.length === 0}
          >
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  )
}


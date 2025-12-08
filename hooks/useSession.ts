'use client'

import { useEffect, useState } from 'react'

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Obtener o crear session_id
    let id = localStorage.getItem('session_id')
    
    if (!id) {
      // Generar un nuevo session_id
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('session_id', id)
    }
    
    setSessionId(id)
  }, [])

  return sessionId
}



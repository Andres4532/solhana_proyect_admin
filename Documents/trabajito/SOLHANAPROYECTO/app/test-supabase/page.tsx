'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test 1: Verificar conexión básica
      console.log('🔍 Test 1: Verificando conexión...')
      const { data: testData, error: testError } = await supabase
        .from('categorias')
        .select('count')
        .limit(1)

      if (testError) {
        setResult({
          success: false,
          error: {
            message: testError.message,
            code: testError.code,
            details: testError.details,
            hint: testError.hint
          },
          suggestion: getSuggestion(testError)
        })
        return
      }

      // Test 2: Intentar obtener todas las categorías
      console.log('🔍 Test 2: Obteniendo categorías...')
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .limit(10)

      if (categoriasError) {
        setResult({
          success: false,
          error: {
            message: categoriasError.message,
            code: categoriasError.code,
            details: categoriasError.details,
            hint: categoriasError.hint
          },
          suggestion: getSuggestion(categoriasError)
        })
        return
      }

      setResult({
        success: true,
        data: categorias,
        count: categorias?.length || 0
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          message: error?.message || 'Error desconocido',
          stack: error?.stack
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuggestion = (error: any) => {
    if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      return 'La tabla "categorias" no existe. Ejecuta el archivo supabase_schema.sql en Supabase SQL Editor.'
    }
    if (error?.code === '42501' || error?.message?.includes('permission denied')) {
      return 'Error de permisos. Verifica las políticas RLS (Row Level Security) en Supabase. Puede que necesites deshabilitar RLS temporalmente o crear políticas.'
    }
    if (error?.code === 'PGRST301') {
      return 'Error de autenticación. Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY sea correcta.'
    }
    return 'Revisa la consola del navegador para más detalles.'
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Test de Conexión a Supabase</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>

      {result && (
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
            marginTop: '20px'
          }}
        >
          {result.success ? (
            <div>
              <h2 style={{ color: '#10b981', marginTop: 0 }}>✅ Conexión Exitosa</h2>
              <p>Categorías encontradas: <strong>{result.count}</strong></p>
              {result.data && result.data.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Datos:</h3>
                  <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 style={{ color: '#ef4444', marginTop: 0 }}>❌ Error de Conexión</h2>
              <div style={{ marginTop: '10px' }}>
                <p><strong>Mensaje:</strong> {result.error?.message}</p>
                {result.error?.code && <p><strong>Código:</strong> {result.error.code}</p>}
                {result.error?.details && <p><strong>Detalles:</strong> {result.error.details}</p>}
                {result.error?.hint && <p><strong>Hint:</strong> {result.error.hint}</p>}
              </div>
              {result.suggestion && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                  <strong>💡 Sugerencia:</strong> {result.suggestion}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>📋 Checklist:</h3>
        <ul>
          <li>✅ Archivo .env.local creado con NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>✅ Servidor reiniciado después de crear .env.local</li>
          <li>✅ Tabla "categorias" creada en Supabase (ejecutar supabase_schema.sql)</li>
          <li>✅ Políticas RLS configuradas o deshabilitadas temporalmente</li>
        </ul>
      </div>
    </div>
  )
}


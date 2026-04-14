'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeOAuthCodeServer } from '@/lib/auth/oauth'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('insforge_code') || searchParams.get('code')

      if (!code) {
        setError('No se recibió código de autorización.')
        return
      }

      // SDK stores PKCE verifier under this key
      const codeVerifier = sessionStorage.getItem('insforge_pkce_verifier')
      if (!codeVerifier) {
        setError('No se encontró el verificador PKCE. Intenta iniciar sesión de nuevo.')
        return
      }

      // Clean up verifier
      sessionStorage.removeItem('insforge_pkce_verifier')

      // Exchange code for tokens server-side (sets httpOnly cookies)
      const result = await exchangeOAuthCodeServer(code, codeVerifier)

      if (!result.success) {
        setError(result.error || 'Error al autenticar.')
        return
      }

      router.replace('/')
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.1] rounded-3xl p-8 max-w-md text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Error de autenticación</h2>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <button
          onClick={() => router.replace('/sign-in')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold cursor-pointer"
        >
          Volver a iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <svg className="animate-spin w-10 h-10 text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-white/50 text-sm">Autenticando...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1145] to-[#24243e]">
      <Suspense fallback={
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/50 text-sm">Cargando...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}

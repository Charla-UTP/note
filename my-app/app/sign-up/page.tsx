'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { signUp, verifyEmail } from '@/lib/auth/actions'
import Link from 'next/link'

export default function SignUpPage() {
  const [signUpState, signUpAction, isSigningUp] = useActionState(signUp, null)
  const [verifyState, verifyAction, isVerifying] = useActionState(verifyEmail, null)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const needsVerification = signUpState?.requireVerification === true
  const email = signUpState?.email ?? ''

  // Focus first OTP input when verification mode activates
  useEffect(() => {
    if (needsVerification) {
      inputRefs.current[0]?.focus()
    }
  }, [needsVerification])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return

    const newValues = [...otpValues]
    newValues[index] = value.slice(-1)
    setOtpValues(newValues)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newValues = [...otpValues]
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || ''
    }
    setOtpValues(newValues)
    const nextEmpty = pasted.length < 6 ? pasted.length : 5
    inputRefs.current[nextEmpty]?.focus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1145] to-[#24243e] px-4">
      {/* Ambient glow effects */}
      <div className="fixed top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-500/25">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {needsVerification ? 'Verifica tu email' : 'Crear cuenta'}
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            {needsVerification
              ? `Ingresa el código de 6 dígitos enviado a ${email}`
              : 'Regístrate para comenzar a usar Note'}
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.1] rounded-3xl p-8 shadow-2xl shadow-black/30">
          {!needsVerification ? (
            /* Sign Up Form */
            <form action={signUpAction} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                />
              </div>

              {/* Error */}
              {signUpState?.error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {signUpState.error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer"
              >
                {isSigningUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Form */
            <form
              action={(formData) => {
                formData.set('email', email)
                formData.set('otp', otpValues.join(''))
                verifyAction(formData)
              }}
              className="space-y-6"
            >
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                ))}
              </div>

              {/* Error */}
              {verifyState?.error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {verifyState.error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isVerifying || otpValues.join('').length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  'Verificar código'
                )}
              </button>

              <p className="text-center text-sm text-white/40">
                ¿No recibiste el código?{' '}
                <button type="button" className="text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer">
                  Reenviar
                </button>
              </p>
            </form>
          )}

          {/* Sign in link */}
          {!needsVerification && (
            <p className="mt-6 text-center text-sm text-white/40">
              ¿Ya tienes cuenta?{' '}
              <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Iniciar sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

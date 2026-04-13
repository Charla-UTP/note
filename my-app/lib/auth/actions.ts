'use server'

import { createInsForgeServerClient } from '@/lib/insforge/server'
import { setAuthCookies, clearAuthCookies, getAccessToken, getRefreshToken } from '@/lib/auth/cookies'
import { redirect } from 'next/navigation'

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos.' }
  }

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.statusCode === 403) {
      return { success: false, error: 'Email no verificado. Por favor verifica tu correo primero.' }
    }
    return { success: false, error: error.message || 'Error al iniciar sesión.' }
  }

  if (!data?.accessToken || !data?.refreshToken) {
    return { success: false, error: 'Error al iniciar sesión.' }
  }

  await setAuthCookies(data.accessToken, data.refreshToken)
  redirect('/')
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) {
    return { success: false, error: 'Todos los campos son requeridos.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.signUp({ email, password, name })

  if (error) {
    return { success: false, error: error.message || 'Error al registrar la cuenta.' }
  }

  if (data?.requireEmailVerification) {
    return {
      success: true,
      requireVerification: true,
      email,
      error: null,
    }
  }

  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken)
    redirect('/')
  }

  return { success: true, requireVerification: false, error: null }
}

export async function verifyEmail(_prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const otp = String(formData.get('otp') ?? '').trim()

  if (!email || !otp) {
    return { success: false, error: 'Email y código son requeridos.' }
  }

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.verifyEmail({ email, otp })

  if (error) {
    if (error.statusCode === 400) {
      return { success: false, error: 'Código inválido o expirado.' }
    }
    return { success: false, error: error.message || 'Error al verificar el email.' }
  }

  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken)
    redirect('/')
  }

  return { success: true, error: null }
}

export async function signOut() {
  const accessToken = await getAccessToken()
  if (accessToken) {
    const insforge = createInsForgeServerClient(accessToken)
    await insforge.auth.signOut().catch(() => {})
  }
  await clearAuthCookies()
  redirect('/sign-in')
}

export async function getCurrentUser() {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    // Try refreshing
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return null

    const insforge = createInsForgeServerClient()
    const { data: refreshData } = await insforge.auth.refreshSession({ refreshToken })
    if (!refreshData?.accessToken || !refreshData?.refreshToken) return null

    await setAuthCookies(refreshData.accessToken, refreshData.refreshToken)

    const insforgeAuth = createInsForgeServerClient(refreshData.accessToken)
    const { data } = await insforgeAuth.auth.getCurrentUser()
    return data?.user ?? null
  }

  const insforge = createInsForgeServerClient(accessToken)
  const { data, error } = await insforge.auth.getCurrentUser()

  if (error || !data?.user) {
    // Try refresh on error
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return null

    const insforgeRefresh = createInsForgeServerClient()
    const { data: refreshData } = await insforgeRefresh.auth.refreshSession({ refreshToken })
    if (!refreshData?.accessToken || !refreshData?.refreshToken) return null

    await setAuthCookies(refreshData.accessToken, refreshData.refreshToken)

    const insforgeAuth = createInsForgeServerClient(refreshData.accessToken)
    const { data: userData } = await insforgeAuth.auth.getCurrentUser()
    return userData?.user ?? null
  }

  return data.user
}

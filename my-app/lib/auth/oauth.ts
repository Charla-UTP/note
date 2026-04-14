'use server'

import { createInsForgeServerClient } from '@/lib/insforge/server'
import { setAuthCookies } from '@/lib/auth/cookies'

export async function exchangeOAuthCodeServer(code: string, codeVerifier: string) {
  try {
    const insforge = createInsForgeServerClient()
    const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier)

    if (error) {
      return { success: false, error: error.message }
    }

    if (data?.accessToken && data?.refreshToken) {
      await setAuthCookies(data.accessToken, data.refreshToken)
      return { success: true, error: null }
    }

    return { success: false, error: 'No tokens received from OAuth exchange.' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

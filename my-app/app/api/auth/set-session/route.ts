import { setAuthCookies } from '@/lib/auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    await setAuthCookies(accessToken, refreshToken)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
  }
}

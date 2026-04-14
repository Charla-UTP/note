'use server'

import { createInsForgeServerClient } from '@/lib/insforge/server'
import { getAccessToken } from '@/lib/auth/cookies'
import { revalidatePath } from 'next/cache'

// ─────────────────── Types ───────────────────

export interface Board {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  board_id: string
  title: string
  position: number
  created_at: string
}

export interface Card {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
  created_at: string
  updated_at: string
}

// ─────────────────── Helpers ───────────────────

async function getAuthClient() {
  const token = await getAccessToken()
  return createInsForgeServerClient(token)
}

// ─────────────────── Boards ───────────────────

export async function getBoards(): Promise<Board[]> {
  const insforge = await getAuthClient()
  const { data, error } = await insforge.database
    .from('boards')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getBoards error:', error)
    return []
  }
  return (data as Board[]) ?? []
}

export async function createBoard(title: string) {
  const insforge = await getAuthClient()
  const { data: userData } = await insforge.auth.getCurrentUser()
  const userId = userData?.user?.id

  if (!userId) return { error: 'No autenticado' }

  const { data, error } = await insforge.database
    .from('boards')
    .insert([{ title, user_id: userId }])
    .select()

  if (error) return { error: error.message }

  revalidatePath('/')
  return { data: (data as Board[])?.[0] }
}

export async function deleteBoard(boardId: string) {
  const insforge = await getAuthClient()
  const { error } = await insforge.database
    .from('boards')
    .delete()
    .eq('id', boardId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

// ─────────────────── Columns ───────────────────

export async function getColumns(boardId: string): Promise<Column[]> {
  const insforge = await getAuthClient()
  const { data, error } = await insforge.database
    .from('columns')
    .select()
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error) {
    console.error('getColumns error:', error)
    return []
  }
  return (data as Column[]) ?? []
}

export async function createColumn(boardId: string, title: string, position: number) {
  const insforge = await getAuthClient()
  const { data, error } = await insforge.database
    .from('columns')
    .insert([{ board_id: boardId, title, position }])
    .select()

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { data: (data as Column[])?.[0] }
}

export async function deleteColumn(columnId: string, boardId: string) {
  const insforge = await getAuthClient()
  const { error } = await insforge.database
    .from('columns')
    .delete()
    .eq('id', columnId)

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function updateColumn(columnId: string, title: string, boardId: string) {
  const insforge = await getAuthClient()
  const { data, error } = await insforge.database
    .from('columns')
    .update({ title })
    .eq('id', columnId)
    .select()

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { data: (data as Column[])?.[0] }
}

// ─────────────────── Cards ───────────────────

export async function getCards(boardId: string): Promise<Card[]> {
  const insforge = await getAuthClient()

  // Get all columns for this board first
  const columns = await getColumns(boardId)
  if (columns.length === 0) return []

  const columnIds = columns.map((c) => c.id)

  const { data, error } = await insforge.database
    .from('cards')
    .select()
    .in('column_id', columnIds)
    .order('position', { ascending: true })

  if (error) {
    console.error('getCards error:', error)
    return []
  }
  return (data as Card[]) ?? []
}

export async function createCard(columnId: string, title: string, description: string, boardId: string) {
  const insforge = await getAuthClient()

  // Get the highest position in this column
  const { data: existing } = await insforge.database
    .from('cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? (existing[0] as Card).position + 1 : 0

  const { data, error } = await insforge.database
    .from('cards')
    .insert([{ column_id: columnId, title, description: description || null, position }])
    .select()

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { data: (data as Card[])?.[0] }
}

export async function updateCard(
  cardId: string,
  updates: { title?: string; description?: string | null; column_id?: string; position?: number },
  boardId: string
) {
  const insforge = await getAuthClient()
  const { data, error } = await insforge.database
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { data: (data as Card[])?.[0] }
}

export async function deleteCard(cardId: string, boardId: string) {
  const insforge = await getAuthClient()
  const { error } = await insforge.database
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function moveCard(cardId: string, newColumnId: string, boardId: string) {
  return updateCard(cardId, { column_id: newColumnId }, boardId)
}

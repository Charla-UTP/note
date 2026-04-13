'use client'

import { useState, useTransition } from 'react'
import {
  createColumn,
  deleteColumn,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
} from '@/lib/kanban/actions'
import type { Column, Card } from '@/lib/kanban/actions'
import { KanbanColumn } from './kanban-column'

interface Props {
  boardId: string
  initialColumns: Column[]
  initialCards: Card[]
}

export function KanbanBoard({ boardId, initialColumns, initialCards }: Props) {
  const [columns, setColumns] = useState(initialColumns)
  const [cards, setCards] = useState(initialCards)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  // ─── Column actions ───

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return
    const title = newColumnTitle.trim()
    const position = columns.length
    setNewColumnTitle('')
    setShowAddColumn(false)

    const tempId = `temp-${Date.now()}`
    const tempCol: Column = { id: tempId, board_id: boardId, title, position, created_at: new Date().toISOString() }
    setColumns((prev) => [...prev, tempCol])

    startTransition(async () => {
      const result = await createColumn(boardId, title, position)
      if (result.data) {
        setColumns((prev) => prev.map((c) => (c.id === tempId ? (result.data as Column) : c)))
      }
    })
  }

  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== columnId))
    setCards((prev) => prev.filter((card) => card.column_id !== columnId))
    startTransition(async () => {
      await deleteColumn(columnId, boardId)
    })
  }

  // ─── Card actions ───

  const handleAddCard = (columnId: string, title: string, description: string) => {
    const tempId = `temp-${Date.now()}`
    const tempCard: Card = {
      id: tempId,
      column_id: columnId,
      title,
      description,
      position: cards.filter((c) => c.column_id === columnId).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCards((prev) => [...prev, tempCard])

    startTransition(async () => {
      const result = await createCard(columnId, title, description, boardId)
      if (result.data) {
        setCards((prev) => prev.map((c) => (c.id === tempId ? (result.data as Card) : c)))
      }
    })
  }

  const handleUpdateCard = (cardId: string, title: string, description: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, title, description, updated_at: new Date().toISOString() } : c
      )
    )
    startTransition(async () => {
      await updateCard(cardId, { title, description }, boardId)
    })
  }

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    startTransition(async () => {
      await deleteCard(cardId, boardId)
    })
  }

  const handleMoveCard = (cardId: string, newColumnId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column_id: newColumnId } : c))
    )
    startTransition(async () => {
      await moveCard(cardId, newColumnId, boardId)
    })
  }

  return (
    <div className="flex gap-5 p-6 overflow-x-auto h-full items-start">
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          cards={cards.filter((c) => c.column_id === col.id)}
          allColumns={columns}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onMoveCard={handleMoveCard}
          onDeleteColumn={handleDeleteColumn}
        />
      ))}

      {/* Add column */}
      {showAddColumn ? (
        <div className="flex-shrink-0 w-[300px] backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4 animate-fade-in">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
            placeholder="Nombre de la columna"
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm mb-3 transition-all duration-200"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddColumn}
              disabled={isPending || !newColumnTitle.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              Crear
            </button>
            <button
              onClick={() => { setShowAddColumn(false); setNewColumnTitle('') }}
              className="px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] text-sm transition-all duration-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddColumn(true)}
          className="flex-shrink-0 w-[300px] flex items-center justify-center gap-2 py-4 backdrop-blur-xl bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl text-white/30 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-sm font-medium">Añadir columna</span>
        </button>
      )}
    </div>
  )
}

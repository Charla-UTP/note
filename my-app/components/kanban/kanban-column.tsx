'use client'

import { useState, useCallback } from 'react'
import type { Column, Card } from '@/lib/kanban/actions'
import { KanbanCard } from './kanban-card'

interface Props {
  column: Column
  cards: Card[]
  allColumns: Column[]
  onAddCard: (columnId: string, title: string, description: string) => void
  onUpdateCard: (cardId: string, title: string, description: string) => void
  onDeleteCard: (cardId: string) => void
  onMoveCard: (cardId: string, newColumnId: string) => void
  onDeleteColumn: (columnId: string) => void
  draggedCardId: string | null
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onDrop: (targetColumnId: string) => void
}

const columnColors: Record<number, string> = {
  0: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  1: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  2: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  3: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  4: 'from-rose-500/20 to-rose-600/10 border-rose-500/20',
}

const dotColors: Record<number, string> = {
  0: 'bg-purple-400',
  1: 'bg-blue-400',
  2: 'bg-emerald-400',
  3: 'bg-amber-400',
  4: 'bg-rose-400',
}

export function KanbanColumn({
  column,
  cards,
  allColumns,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onDeleteColumn,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onDrop,
}: Props) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const colorIdx = column.position % 5
  const headerColor = columnColors[colorIdx] ?? columnColors[0]
  const dotColor = dotColors[colorIdx] ?? dotColors[0]

  const handleAdd = () => {
    if (!newCardTitle.trim()) return
    onAddCard(column.id, newCardTitle.trim(), newCardDesc.trim())
    setNewCardTitle('')
    setNewCardDesc('')
    setShowAddCard(false)
  }

  const handleDeleteColumn = () => {
    if (cards.length > 0 && !showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDeleteColumn(column.id)
    setShowDeleteConfirm(false)
  }

  // ─── Drag handlers ───

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if leaving the column entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }, [])

  const handleDropOnColumn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(column.id)
  }, [column.id, onDrop])

  // Check if the dragged card is from this column
  const isDraggedFromHere = draggedCardId ? cards.some((c) => c.id === draggedCardId) : false
  const showDropZone = draggedCardId && !isDraggedFromHere

  return (
    <div
      className={`flex-shrink-0 w-[300px] flex flex-col max-h-[calc(100vh-120px)] transition-all duration-200 ${
        isDragOver && showDropZone ? 'scale-[1.02]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnColumn}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${headerColor} border border-b-0 border-white/[0.06]`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          <span className="text-xs text-white/30 ml-1">{cards.length}</span>
        </div>
        <div className="relative">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 animate-fade-in">
              <span className="text-[10px] text-red-300 mr-1">¿Seguro?</span>
              <button
                onClick={handleDeleteColumn}
                className="px-2 py-0.5 rounded-md text-[10px] text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Sí
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-0.5 rounded-md text-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteColumn}
              className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              title="Eliminar columna"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Cards area */}
      <div
        className={`flex-1 overflow-y-auto border-x border-white/[0.06] px-3 py-3 space-y-2.5 transition-all duration-200 ${
          isDragOver && showDropZone
            ? 'bg-purple-500/[0.06] border-purple-500/20'
            : 'bg-white/[0.02]'
        }`}
      >
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            allColumns={allColumns}
            currentColumnId={column.id}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onMove={onMoveCard}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggedCardId === card.id}
          />
        ))}

        {/* Drop zone indicator when dragging */}
        {showDropZone && cards.length === 0 && (
          <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed transition-all duration-200 ${
            isDragOver
              ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
              : 'border-white/[0.08] text-white/20'
          }`}>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs font-medium">Soltar aquí</span>
            </div>
          </div>
        )}

        {/* Drop zone at end of non-empty columns */}
        {showDropZone && cards.length > 0 && (
          <div className={`py-3 rounded-lg border-2 border-dashed text-center transition-all duration-200 ${
            isDragOver
              ? 'border-purple-500/30 bg-purple-500/5 text-purple-300'
              : 'border-transparent text-transparent'
          }`}>
            <span className="text-[10px] font-medium">Soltar aquí</span>
          </div>
        )}

        {/* Add card form */}
        {showAddCard && (
          <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 space-y-2 animate-fade-in">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setShowAddCard(false); setNewCardTitle(''); setNewCardDesc('') }
              }}
              placeholder="Título de la tarea"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
            />
            <textarea
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setShowAddCard(false); setNewCardTitle(''); setNewCardDesc('') }
              }}
              placeholder="Descripción (opcional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newCardTitle.trim()}
                className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                Agregar
              </button>
              <button
                onClick={() => { setShowAddCard(false); setNewCardTitle(''); setNewCardDesc('') }}
                className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] text-xs transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add card button */}
      <button
        onClick={() => setShowAddCard(true)}
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-b-2xl bg-white/[0.02] border border-t-0 border-white/[0.06] text-white/30 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200 cursor-pointer text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Añadir tarea
      </button>
    </div>
  )
}

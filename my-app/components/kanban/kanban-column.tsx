'use client'

import { useState } from 'react'
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

export function KanbanColumn({ column, cards, allColumns, onAddCard, onUpdateCard, onDeleteCard, onMoveCard, onDeleteColumn }: Props) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')

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

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col max-h-[calc(100vh-120px)]">
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${headerColor} border border-b-0 border-white/[0.06]`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          <span className="text-xs text-white/30 ml-1">{cards.length}</span>
        </div>
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
          title="Eliminar columna"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto bg-white/[0.02] border-x border-white/[0.06] px-3 py-3 space-y-2.5">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            allColumns={allColumns}
            currentColumnId={column.id}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onMove={onMoveCard}
          />
        ))}

        {/* Add card form */}
        {showAddCard && (
          <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 space-y-2 animate-fade-in">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Título de la tarea"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
            />
            <textarea
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
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

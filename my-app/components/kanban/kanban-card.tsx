'use client'

import { useState } from 'react'
import type { Column, Card } from '@/lib/kanban/actions'

interface Props {
  card: Card
  allColumns: Column[]
  currentColumnId: string
  onUpdate: (cardId: string, title: string, description: string) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, newColumnId: string) => void
}

export function KanbanCard({ card, allColumns, currentColumnId, onUpdate, onDelete, onMove }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDesc, setEditDesc] = useState(card.description ?? '')
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const otherColumns = allColumns.filter((c) => c.id !== currentColumnId)
  const currentIdx = allColumns.findIndex((c) => c.id === currentColumnId)
  const prevColumn = currentIdx > 0 ? allColumns[currentIdx - 1] : null
  const nextColumn = currentIdx < allColumns.length - 1 ? allColumns[currentIdx + 1] : null

  const handleSave = () => {
    if (!editTitle.trim()) return
    onUpdate(card.id, editTitle.trim(), editDesc.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(card.title)
    setEditDesc(card.description ?? '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white/[0.08] border border-purple-500/20 rounded-xl p-3 space-y-2 animate-fade-in">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-200"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] text-xs transition-all duration-200 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 transition-all duration-200">
      {/* Card content */}
      <h4 className="text-sm font-medium text-white/90 pr-16">{card.title}</h4>
      {card.description && (
        <p className="text-xs text-white/40 mt-1.5 line-clamp-2">{card.description}</p>
      )}

      {/* Quick move arrows */}
      <div className="flex items-center gap-1 mt-2">
        {prevColumn && (
          <button
            onClick={() => onMove(card.id, prevColumn.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/25 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
            title={`Mover a ${prevColumn.title}`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {prevColumn.title}
          </button>
        )}
        {nextColumn && (
          <button
            onClick={() => onMove(card.id, nextColumn.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/25 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
            title={`Mover a ${nextColumn.title}`}
          >
            {nextColumn.title}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Action buttons (top right) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Move to any column */}
        {otherColumns.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
              title="Mover a..."
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            {showMoveMenu && (
              <div className="absolute right-0 top-8 z-50 w-40 bg-[#1a1145] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 p-1.5 animate-fade-in">
                {otherColumns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => { onMove(card.id, col.id); setShowMoveMenu(false) }}
                    className="w-full px-3 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit */}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg text-white/30 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer"
          title="Editar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(card.id)}
          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
          title="Eliminar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

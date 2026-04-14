'use client'

import { useState, useCallback } from 'react'
import type { Column, Card } from '@/lib/kanban/actions'

interface Props {
  card: Card
  allColumns: Column[]
  currentColumnId: string
  onUpdate: (cardId: string, title: string, description: string) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, newColumnId: string) => void
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  isDragging: boolean
}

export function KanbanCard({
  card,
  allColumns,
  currentColumnId,
  onUpdate,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDesc, setEditDesc] = useState(card.description ?? '')
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDelete(card.id)
  }

  // ─── Drag handlers ───

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', card.id)
    // Add a slight delay so the drag image captures properly
    requestAnimationFrame(() => {
      onDragStart(card.id)
    })
  }, [card.id, onDragStart])

  const handleDragEnd = useCallback(() => {
    onDragEnd()
  }, [onDragEnd])

  if (isEditing) {
    return (
      <div className="bg-white/[0.08] border border-purple-500/20 rounded-xl p-3 space-y-2 animate-fade-in">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel()
          }}
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
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-95 rotate-1' : ''
      }`}
    >
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
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoveMenu(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-44 bg-[#1a1145]/95 backdrop-blur-xl border border-white/[0.12] rounded-xl shadow-2xl shadow-black/50 p-1.5 animate-fade-in">
                  <p className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider font-medium">Mover a</p>
                  {otherColumns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => { onMove(card.id, col.id); setShowMoveMenu(false) }}
                      className="w-full px-3 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        dotColors[col.position % 5] ?? 'bg-purple-400'
                      }`} />
                      {col.title}
                    </button>
                  ))}
                </div>
              </>
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
        <div className="relative">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 animate-fade-in">
              <button
                onClick={() => onDelete(card.id)}
                className="px-2 py-1 rounded-md text-[10px] text-red-400 bg-red-500/15 hover:bg-red-500/25 transition-all cursor-pointer font-medium"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-1.5 py-1 rounded-md text-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              title="Eliminar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Export dotColors for use in column component
const dotColors: Record<number, string> = {
  0: 'bg-purple-400',
  1: 'bg-blue-400',
  2: 'bg-emerald-400',
  3: 'bg-amber-400',
  4: 'bg-rose-400',
}

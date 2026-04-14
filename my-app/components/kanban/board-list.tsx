'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createBoard, deleteBoard, updateBoard } from '@/lib/kanban/actions'
import type { Board } from '@/lib/kanban/actions'
import Link from 'next/link'

export function BoardList({ initialBoards }: { initialBoards: Board[] }) {
  const [boards, setBoards] = useState(initialBoards)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingBoardId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingBoardId])

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')
    setShowCreate(false)

    startTransition(async () => {
      const result = await createBoard(title)
      if (result.data) {
        setBoards((prev) => [result.data as Board, ...prev])
      }
    })
  }

  const handleDelete = (boardId: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId))
    startTransition(async () => {
      await deleteBoard(boardId)
    })
  }

  const startEditing = (board: Board) => {
    setEditingBoardId(board.id)
    setEditTitle(board.title)
  }

  const handleSaveEdit = () => {
    if (!editingBoardId) return
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== boards.find((b) => b.id === editingBoardId)?.title) {
      setBoards((prev) =>
        prev.map((b) => (b.id === editingBoardId ? { ...b, title: trimmed } : b))
      )
      const boardId = editingBoardId
      startTransition(async () => {
        await updateBoard(boardId, trimmed)
      })
    }
    setEditingBoardId(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') setEditingBoardId(null)
  }

  return (
    <>
      {boards.length === 0 && !showCreate ? (
        /* Empty state */
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-3xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 mb-6">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tienes tableros aún</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Crea tu primer tablero Kanban para comenzar a organizar tus tareas y proyectos.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 cursor-pointer"
          >
            + Crear tablero
          </button>
        </div>
      ) : (
        <>
          {/* Board grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-300"
              >
                {editingBoardId === board.id ? (
                  /* Editing mode */
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.1] border border-white/[0.15] text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
                      />
                      <p className="text-[10px] text-white/25 mt-2">Enter para guardar · Esc para cancelar</p>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <>
                    <Link href={`/board/${board.id}`} className="block">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {board.title}
                          </h3>
                          <p className="text-xs text-white/30 mt-1">
                            {new Date(board.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => startEditing(board)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer"
                        title="Editar nombre"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(board.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                        title="Eliminar tablero"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Create new board card */}
            {!showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-2 min-h-[120px] backdrop-blur-xl bg-white/[0.02] border border-dashed border-white/[0.1] rounded-2xl p-6 text-white/30 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-sm font-medium">Nuevo tablero</span>
              </button>
            )}
          </div>

          {/* Create form inline */}
          {showCreate && (
            <div className="mt-4 backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6 max-w-md animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Crear tablero</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Nombre del tablero"
                  autoFocus
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 text-sm"
                />
                <button
                  onClick={handleCreate}
                  disabled={isPending || !newTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  Crear
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewTitle('') }}
                  className="px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

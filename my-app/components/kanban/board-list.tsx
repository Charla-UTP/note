'use client'

import { useState, useTransition } from 'react'
import { createBoard, deleteBoard } from '@/lib/kanban/actions'
import type { Board } from '@/lib/kanban/actions'
import Link from 'next/link'

export function BoardList({ initialBoards }: { initialBoards: Board[] }) {
  const [boards, setBoards] = useState(initialBoards)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()

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
                <button
                  onClick={() => handleDelete(board.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                  title="Eliminar tablero"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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

import { getCurrentUser, signOut } from '@/lib/auth/actions'
import { getColumns, getCards } from '@/lib/kanban/actions'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: boardId } = await params
  const user = await getCurrentUser()
  const columns = await getColumns(boardId)
  const cards = await getCards(boardId)

  if (!user) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1145] to-[#24243e] flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">Note</h1>
            </Link>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-white/50">Tablero</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <KanbanBoard boardId={boardId} initialColumns={columns} initialCards={cards} />
      </main>
    </div>
  )
}

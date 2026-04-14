import { getCurrentUser } from '@/lib/auth/actions'
import { signOut } from '@/lib/auth/actions'
import { getBoards } from '@/lib/kanban/actions'
import { BoardList } from '@/components/kanban/board-list'
import Link from 'next/link'

export default async function Home() {
  const user = await getCurrentUser()
  const boards = await getBoards()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1145] to-[#24243e]">
      {/* Ambient glow */}
      <div className="fixed top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <Link href="/">
              <h1 className="text-xl font-bold text-white tracking-tight">Note</h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white/90">{user?.profile?.name || 'Usuario'}</p>
                <p className="text-xs text-white/40">{user?.email}</p>
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {user?.profile?.name?.split(' ')[0] || 'Usuario'} 👋
          </h2>
          <p className="text-white/50">
            Organiza tus tareas con tableros Kanban
          </p>
        </div>

        <BoardList initialBoards={boards} />
      </main>
    </div>
  )
}

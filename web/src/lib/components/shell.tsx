import { Plus } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/lib/components/button'
import { SearchInput } from '@/lib/components/search-input'
import { api } from '@/lib/http-transport/api'

export const Shell = () => {
  const navigate = useNavigate()

  const createBoard = async () => {
    const board = await api.boards.create()

    navigate(`/${board.id}`)
  }

  return (
    <div className='flex h-screen w-screen bg-sidebar'>
      <aside className='flex w-56 flex-col gap-6 p-3'>
        <Link to='/' className='flex items-center gap-2.5 px-1 py-2'>
          <img src='/logo.svg' alt='ExcaliHome' className='size-8 rounded-lg' />
          <span className='text-lg font-semibold leading-none tracking-tight text-sidebar-foreground'>ExcaliHome</span>
        </Link>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 shrink-0 items-center justify-between gap-4 px-3'>
          <SearchInput />
          <Button onClick={createBoard}>
            <Plus />
            Create board
          </Button>
        </header>
        <main className='mb-2 mr-2 flex-1 overflow-auto rounded-xl border border-sidebar-border bg-background p-2'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

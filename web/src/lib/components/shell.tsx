import { useEffect, useState } from 'react'
import { Home, Pencil, Pin, PinOff, Plus, Presentation, Settings, Trash2 } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/lib/components/button'
import { NavGroup } from '@/lib/components/nav-group'
import { NavItem } from '@/lib/components/nav-item'
import { SearchInput } from '@/lib/components/search-input'
import { ShortcutBadge } from '@/lib/components/shortcut-badge'
import { api, BoardSummary } from '@/lib/http-transport/api'

export const Shell = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [boards, setBoards] = useState<BoardSummary[]>()

  useEffect(() => {
    api.boards.list().then(setBoards)
  }, [pathname])

  const createBoard = async () => {
    const board = await api.boards.create()

    navigate(`/${board.id}`)
  }

  const togglePin = async (board: BoardSummary) => {
    await api.boards.pin(board.id, !board.pinned)

    api.boards.list().then(setBoards)
  }

  const renameBoard = async (board: BoardSummary) => {
    const name = window.prompt('Rename board', board.name)?.trim()

    if (!name || name === board.name) return

    await api.boards.update(board.id, { name })

    api.boards.list().then(setBoards)
  }

  const deleteBoard = async (board: BoardSummary) => {
    if (!window.confirm(`Delete "${board.name}"? This cannot be undone.`)) return

    await api.boards.delete(board.id)

    // Navigating away from the deleted board triggers the refetch via pathname
    if (pathname === `/${board.id}`) navigate('/')
    else api.boards.list().then(setBoards)
  }

  const boardItem = (board: BoardSummary) => (
    <NavItem
      key={board.id}
      to={`/${board.id}`}
      icon={board.pinned ? <Pin /> : <Presentation />}
      actions={[
        {
          icon: board.pinned ? <PinOff /> : <Pin />,
          label: board.pinned ? 'Unpin' : 'Pin',
          action: () => togglePin(board),
        },
        { icon: <Pencil />, label: 'Rename', action: () => renameBoard(board) },
        { icon: <Trash2 />, label: 'Delete', action: () => deleteBoard(board), destructive: true },
      ]}
    >
      {board.name}
    </NavItem>
  )

  const pinnedBoards = boards?.filter((board) => board.pinned)
  const recentBoards = boards?.filter((board) => !board.pinned)

  return (
    <div className='flex h-screen w-screen flex-col bg-sidebar'>
      <header className='grid h-14 shrink-0 grid-cols-[1fr_minmax(0,24rem)_1fr] items-center gap-4 px-2'>
        <Link to='/' className='flex items-center gap-2 justify-self-start px-1 py-2'>
          <img src='/logo.svg' alt='ExcaliHome' className='size-8 rounded-lg' />
          <span className='text-lg font-semibold leading-none tracking-tight text-sidebar-foreground'>ExcaliHome</span>
        </Link>
        <SearchInput />
        <Button onClick={createBoard} className='justify-self-end'>
          <Plus />
          Create
          <ShortcutBadge action='createBoard' />
        </Button>
      </header>

      <div className='flex min-h-0 flex-1'>
        <aside className='flex w-56 flex-col gap-2 p-2'>
          <nav className='flex flex-col gap-1'>
            <NavItem to='/' end icon={<Home />}>
              Home
            </NavItem>
            <NavItem to='/settings' icon={<Settings />}>
              Settings
            </NavItem>
          </nav>

          {!!pinnedBoards?.length && <NavGroup title='Pinned'>{pinnedBoards.map(boardItem)}</NavGroup>}

          <NavGroup title='Recents'>
            {recentBoards?.map(boardItem)}
          </NavGroup>
        </aside>

        <main className='mb-2 mr-2 min-w-0 flex-1 overflow-auto rounded-xl border border-sidebar-border bg-background'>
          <Outlet context={boards} />
        </main>
      </div>
    </div>
  )
}

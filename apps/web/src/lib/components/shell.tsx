import { useEffect, useState } from 'react'
import { Home, Monitor, Moon, Pencil, Pin, PinOff, Plus, Presentation, Settings, Sun, Trash2 } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/lib/components/button'
import { NavGroup } from '@/lib/components/nav-group'
import { NavItem } from '@/lib/components/nav-item'
import { SearchInput } from '@/lib/components/search-input'
import { ShortcutBadge } from '@/lib/components/shortcut-badge'
import { api, BoardSummary } from '@/lib/http-transport/api'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export interface ShellContext {
  boards: BoardSummary[] | undefined
  refreshBoards: () => void
  focusMode: boolean
  setFocusMode: (focusMode: boolean) => void
}

export const Shell = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()

  const [boards, setBoards] = useState<BoardSummary[]>()
  // Hides the header and sidebar so a board fills the window; toggled from the board page
  const [focusMode, setFocusMode] = useState(false)

  const refreshBoards = () => {
    api.boards.list().then(setBoards)
  }

  useEffect(refreshBoards, [pathname])

  const createBoard = async () => {
    const board = await api.boards.create()

    navigate(`/${board.id}`)
  }

  const togglePin = async (board: BoardSummary) => {
    await api.boards.pin(board.id, !board.pinned)

    refreshBoards()
  }

  const renameBoard = async (board: BoardSummary) => {
    const name = window.prompt('Rename board', board.name)?.trim()

    if (!name || name === board.name) return

    await api.boards.update(board.id, { name })

    refreshBoards()
  }

  const deleteBoard = async (board: BoardSummary) => {
    if (!window.confirm(`Delete "${board.name}"? This cannot be undone.`)) return

    await api.boards.delete(board.id)

    // Navigating away from the deleted board triggers the refetch via pathname
    if (pathname === `/${board.id}`) navigate('/')
    else refreshBoards()
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
      <header hidden={focusMode} className='grid h-14 shrink-0 grid-cols-[1fr_minmax(0,24rem)_1fr] items-center gap-4 px-2'>
        <Link to='/' className='flex items-center gap-2 justify-self-start px-1 py-2'>
          <img src='/logo.svg' alt='ExcaliHome' className='size-8 rounded-lg' />
          <span className='text-lg leading-none font-semibold tracking-tight text-sidebar-foreground'>ExcaliHome</span>
        </Link>
        <SearchInput />
        <Button onClick={createBoard} className='justify-self-end'>
          <Plus />
          Create
          <ShortcutBadge action='createBoard' />
        </Button>
      </header>

      <div className='flex min-h-0 flex-1'>
        <aside hidden={focusMode} className='flex w-56 flex-col p-2'>
          <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto'>
            <nav className='flex flex-col gap-1'>
              <NavItem to='/' end icon={<Home />}>
                Home
              </NavItem>
              <NavItem to='/settings' icon={<Settings />}>
                Settings
              </NavItem>
            </nav>

            {!!pinnedBoards?.length && <NavGroup title='Pinned'>{pinnedBoards.map(boardItem)}</NavGroup>}

            <NavGroup title='Recents'>{recentBoards?.map(boardItem)}</NavGroup>
          </div>

          <footer className='flex items-center gap-1 pt-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              title={`Theme: ${theme}`}
              className='size-7 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            >
              {theme === 'light' ? <Sun /> : theme === 'dark' ? <Moon /> : <Monitor />}
            </Button>
          </footer>
        </aside>

        <main className={cn('min-w-0 flex-1 overflow-auto bg-background', !focusMode && 'mr-2 mb-2 rounded-xl border border-sidebar-border')}>
          <Outlet context={{ boards, refreshBoards, focusMode, setFocusMode } satisfies ShellContext} />
        </main>
      </div>
    </div>
  )
}

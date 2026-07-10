import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { api, BoardSummary } from '@/lib/http-transport/api'

export default function Home() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [boards, setBoards] = useState<BoardSummary[]>()

  useEffect(() => {
    api.boards.list(q ? { search: q } : undefined).then(setBoards)
  }, [q])

  if (!boards) return null

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-lg font-semibold tracking-tight text-foreground'>All boards</h1>
      {boards.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{q ? `No boards matching “${q}”.` : 'No boards yet. Create one to get started.'}</p>
      ) : (
        <div className='flex flex-wrap gap-3'>
          {boards.map((board) => (
            <Link
              className='flex w-44 flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent'
              key={board.id}
              to={`/${board.id}`}
            >
              <p className='truncate text-sm font-medium text-card-foreground'>{board.name}</p>
              <p className='text-xs text-muted-foreground'>{new Date(board.updatedAt).toLocaleDateString('en-GB')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

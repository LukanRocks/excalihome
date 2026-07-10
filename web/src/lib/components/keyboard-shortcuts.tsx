import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '@/lib/http-transport/api'
import { matchesShortcut, shortcuts } from '@/lib/shortcuts'

export const KeyboardShortcuts = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      if (matchesShortcut(event, shortcuts.createBoard)) {
        event.preventDefault()

        const board = await api.boards.create()

        navigate(`/${board.id}`)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  return null
}

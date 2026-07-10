import '@excalidraw/excalidraw/index.css'

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import { Excalidraw, hashElementsVersion, MainMenu } from '@excalidraw/excalidraw'
import { AppState, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'

import { ShellContext } from '@/lib/components/shell'
import { useCollaboration } from '@/lib/hooks/use-collaboration'
import { api } from '@/lib/http-transport/api'
import { useTheme } from '@/lib/theme'

const SAVE_DEBOUNCE_MS = 800

// Viewport and selection are deliberately left out — viewing a board shouldn't count as activity.
// Theme is excluded too: it follows the app-wide theme instead of being saved per board.
const persistableAppState = (appState: Partial<AppState>) => ({
  viewBackgroundColor: appState.viewBackgroundColor,
  gridModeEnabled: appState.gridModeEnabled,
})

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { resolvedTheme } = useTheme()
  const { boards, refreshBoards } = useOutletContext<ShellContext>()

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const { broadcastScene, broadcastPointer } = useCollaboration(Number(id), excalidrawAPI)

  // The sidebar owns the board list, so its name is the source of truth — renaming
  // there (or here) flows back through the outlet context.
  const savedName = boards?.find((board) => board.id === Number(id))?.name

  const [name, setName] = useState(savedName)
  const skipRename = useRef(false)

  useEffect(() => setName(savedName), [savedName])

  const commitRename = () => {
    if (skipRename.current) {
      skipRename.current = false

      return
    }

    const trimmed = name?.trim()

    if (!trimmed || trimmed === savedName) {
      setName(savedName)

      return
    }

    setName(trimmed)
    api.boards.update(Number(id), { name: trimmed }).then(refreshBoards)
  }

  const lastSavedVersion = useRef(0)
  const lastSavedAppState = useRef('')
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pendingSave = useRef<(() => void) | null>(null)

  const flushSave = () => {
    clearTimeout(saveTimeout.current)

    pendingSave.current?.()
    pendingSave.current = null
  }

  // Save any pending changes when switching boards or leaving the page
  useEffect(() => flushSave, [id])

  return (
    <div className='relative h-full w-full'>
      <Excalidraw
        key={id}
        theme={resolvedTheme}
        excalidrawAPI={setExcalidrawAPI}
        initialData={async () => {
          const board = await api.boards.get(Number(id)).catch(() => null)

          if (!board) {
            navigate('/', { replace: true })

            return null
          }

          const data = board.boardData as ExcalidrawInitialDataState

          lastSavedVersion.current = hashElementsVersion(data.elements ?? [])
          lastSavedAppState.current = JSON.stringify(persistableAppState(data.appState ?? {}))

          return data
        }}
        onPointerUpdate={broadcastPointer}
        onChange={(elements, appState, files) => {
          broadcastScene(elements)

          // Scene version only moves on element changes — selection and panning don't trigger saves
          const version = hashElementsVersion(elements)
          const appStateSnapshot = JSON.stringify(persistableAppState(appState))

          if (version === lastSavedVersion.current && appStateSnapshot === lastSavedAppState.current) return

          pendingSave.current = () => {
            lastSavedVersion.current = version
            lastSavedAppState.current = appStateSnapshot

            api.boards.update(Number(id), {
              boardData: {
                elements: elements.filter((element) => !element.isDeleted),
                appState: persistableAppState(appState),
                files,
              },
            })
          }

          clearTimeout(saveTimeout.current)
          saveTimeout.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
      </Excalidraw>

      {name !== undefined && (
        <input
          aria-label='Board name'
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()

            if (event.key === 'Escape') {
              skipRename.current = true
              setName(savedName)
              event.currentTarget.blur()
            }
          }}
          // Aligned next to Excalidraw's hamburger island: 1rem editor padding + 2.25rem button + 0.5rem gap
          className='absolute left-15 top-4 z-10 h-9 min-w-24 max-w-72 rounded-lg bg-transparent px-3 text-sm font-medium text-foreground outline-none transition-colors field-sizing-content hover:bg-accent focus:bg-background focus:shadow-md focus:ring-2 focus:ring-ring'
        />
      )}
    </div>
  )
}

import '@excalidraw/excalidraw/index.css'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Clock, CloudCheck, Download, FolderOpen, LoaderCircle, Trash2 } from 'lucide-react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import { Excalidraw, hashElementsVersion, MainMenu, serializeAsJSON } from '@excalidraw/excalidraw'
import { AppState, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'

import { ShellContext } from '@/lib/components/shell'
import { useCollaboration } from '@/lib/hooks/use-collaboration'
import { api } from '@/lib/http-transport/api'
import { useTheme } from '@/lib/theme'
import { downloadFile } from '@/lib/utils'

const SAVE_DEBOUNCE_MS = 800

const SAVE_STATES = {
  saved: { icon: <CloudCheck />, label: 'Saved' },
  pending: { icon: <Clock />, label: 'Unsaved changes' },
  saving: { icon: <LoaderCircle className='animate-spin' />, label: 'Saving…' },
}

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

  const [saveStatus, setSaveStatus] = useState<keyof typeof SAVE_STATES>('saved')

  const lastSavedVersion = useRef(0)
  const lastSavedAppState = useRef('')
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pendingSave = useRef<(() => void) | null>(null)

  const flushSave = () => {
    clearTimeout(saveTimeout.current)

    pendingSave.current?.()
    pendingSave.current = null
  }

  // Save any pending changes when switching boards or leaving the page; the flush
  // cleanup runs before the reset, so the indicator starts fresh on the new board
  useEffect(() => {
    setSaveStatus('saved')

    return flushSave
  }, [id])

  const fileInput = useRef<HTMLInputElement>(null)

  // Overrides Excalidraw's Open: instead of replacing the current scene, the file
  // becomes a new board and we navigate to it
  const openFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]

    input.value = '' // Allow re-selecting the same file later

    if (!file) return

    try {
      const [board] = await api.boards.import([
        {
          name: file.name.replace(/\.excalidraw$/i, ''),
          contents: await file.text(),
        },
      ])

      navigate(`/${board.id}`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to open file. Please try again.')
    }
  }

  // Serializes the live scene (including changes still in the save debounce window),
  // producing the same file format the bulk export uses
  const exportBoard = () => {
    if (!excalidrawAPI) return

    const json = serializeAsJSON(excalidrawAPI.getSceneElements(), excalidrawAPI.getAppState(), excalidrawAPI.getFiles(), 'local')

    downloadFile(`${savedName ?? 'board'}.excalidraw`, new Blob([json], { type: 'application/json' }))
  }

  const deleteBoard = async () => {
    if (!window.confirm(`Delete "${savedName}"? This cannot be undone.`)) return

    // Drop any pending debounced save so it doesn't fire against the deleted board
    clearTimeout(saveTimeout.current)
    pendingSave.current = null

    await api.boards.delete(Number(id))

    navigate('/')
  }

  return (
    <div
      className='relative h-full w-full'
      // Excalidraw has no UIOption for the help dialog, so its '?' shortcut is
      // intercepted before it reaches the canvas. Typing '?' in text elements is
      // unaffected — stopping propagation doesn't block text input.
      onKeyDownCapture={(event) => {
        if (event.key === '?') event.stopPropagation()
      }}
    >
      <Excalidraw
        key={id}
        theme={resolvedTheme}
        excalidrawAPI={setExcalidrawAPI}
        UIOptions={{ canvasActions: { loadScene: false, export: false, saveToActiveFile: false } }}
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

          setSaveStatus('pending')

          pendingSave.current = () => {
            lastSavedVersion.current = version
            lastSavedAppState.current = appStateSnapshot

            setSaveStatus('saving')

            api.boards.update(Number(id), {
              boardData: {
                elements: elements.filter((element) => !element.isDeleted),
                appState: persistableAppState(appState),
                files,
              },
            })
              // Newer edits may have queued another save while this one was in flight
              .then(() => !pendingSave.current && setSaveStatus('saved'))
              .catch(() => setSaveStatus('pending'))
          }

          clearTimeout(saveTimeout.current)
          saveTimeout.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
        }}
        renderTopRightUI={() => (
          <div className='flex h-9 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground [&_svg]:size-4'>
            {SAVE_STATES[saveStatus].icon}
            {SAVE_STATES[saveStatus].label}
          </div>
        )}
      >
        <MainMenu>
          <MainMenu.Item icon={<FolderOpen />} onSelect={() => fileInput.current?.click()}>
            Open
          </MainMenu.Item>
          <MainMenu.Item icon={<Download />} onSelect={exportBoard}>
            Export
          </MainMenu.Item>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.Separator />
          <MainMenu.Item icon={<Trash2 />} onSelect={deleteBoard} className='text-destructive!'>
            Delete
          </MainMenu.Item>
        </MainMenu>
      </Excalidraw>

      <input ref={fileInput} type='file' accept='.excalidraw' hidden onChange={openFile} />

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

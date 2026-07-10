import '@excalidraw/excalidraw/index.css'

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Excalidraw, hashElementsVersion, MainMenu } from '@excalidraw/excalidraw'
import { AppState, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'

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

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const { broadcastScene, broadcastPointer } = useCollaboration(Number(id), excalidrawAPI)

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
  )
}

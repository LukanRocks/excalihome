import '@excalidraw/excalidraw/index.css'

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'

import { api } from '@/lib/http-transport/api'

import { ChevronLeft, Plus, FolderOpen, FileUp, FileDown, Shredder } from 'lucide-react'

export default function Board() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | undefined>(undefined)

  const { id } = useParams()
  const navigate = useNavigate()

  const save = () => {
    // ! I'm not saving appState because it's giving an error
    api.boards.update(Number(id), {
      boardData: { elements: excalidrawAPI?.getSceneElements() },
    })
  }

  // Menu Actions
  const navigateHome = () => navigate('/')
  const createNewCanvas = async () => {
    const board = await api.boards.create()

    navigate(`/${board.id}`)
  }

  const openCanvas = () => window.alert('Item1')
  const importCanvas = () => window.alert('Item1')
  const resetCanvas = () => window.alert('Item1')
  const exportCanvas = () => window.alert('Item1')

  return (
    <Excalidraw
      key={id}
      isCollaborating={false}
      excalidrawAPI={(excalidraw) => setExcalidrawAPI(excalidraw)}
      onPointerUp={save}
      initialData={async () => {
        const board = await api.boards.get(Number(id)).catch(() => null)

        return (board?.boardData ?? null) as ExcalidrawInitialDataState | null
      }}
    >
      <MainMenu>
        <MainMenu.Item onSelect={navigateHome} icon={<ChevronLeft />}>
          Home
        </MainMenu.Item>

        <MainMenu.Group title='Actions'>
          <MainMenu.Item onSelect={createNewCanvas} icon={<Plus />}>
            New
          </MainMenu.Item>
          <MainMenu.Item onSelect={openCanvas} icon={<FolderOpen />}>
            Open
          </MainMenu.Item>
          <MainMenu.Item onSelect={importCanvas} icon={<FileUp />}>
            Import
          </MainMenu.Item>
          <MainMenu.Item onSelect={exportCanvas} icon={<FileDown />}>
            Export
          </MainMenu.Item>
          <MainMenu.Item onSelect={resetCanvas} icon={<Shredder className='text-red-500' />}>
            <span className='text-red-500'>Reset</span>
          </MainMenu.Item>
        </MainMenu.Group>

        <MainMenu.Group title='Excalidraw'>
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.Socials />
        </MainMenu.Group>
      </MainMenu>
    </Excalidraw>
  )
}

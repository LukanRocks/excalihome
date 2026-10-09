import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

import { CaptureUpdateAction, hashElementsVersion, reconcileElements } from '@excalidraw/excalidraw'
import { Collaborator, ExcalidrawImperativeAPI, SocketId } from '@excalidraw/excalidraw/types'

import { getUsername } from '@/lib/username'

const BROADCAST_THROTTLE_MS = 100

type LocalElements = Parameters<typeof reconcileElements>[0]
type RemoteElements = Parameters<typeof reconcileElements>[1]

interface PointerPayload {
  pointer: { x: number; y: number; tool: 'pointer' | 'laser' }
  button: 'down' | 'up'
}

export const useCollaboration = (boardId: number, excalidrawAPI: ExcalidrawImperativeAPI | null) => {
  const socketRef = useRef<Socket | null>(null)
  const lastSyncedVersion = useRef(0)
  const lastEmitAt = useRef(0)
  const trailingEmit = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!excalidrawAPI) return

    const socket = io()
    socketRef.current = socket

    const joinBoard = () => socket.emit('join-board', boardId)

    joinBoard()
    socket.io.on('reconnect', joinBoard)

    const collaborators = new Map<SocketId, Collaborator>()

    socket.on('scene-update', (remoteElements: RemoteElements) => {
      const reconciled = reconcileElements(excalidrawAPI.getSceneElementsIncludingDeleted(), remoteElements, excalidrawAPI.getAppState())

      // Remember the merged version so the onChange this triggers isn't echoed back
      lastSyncedVersion.current = hashElementsVersion(reconciled)

      excalidrawAPI.updateScene({ elements: reconciled, captureUpdate: CaptureUpdateAction.NEVER })
    })

    socket.on('pointer-update', (socketId: SocketId, collaborator: Collaborator) => {
      collaborators.set(socketId, collaborator)
      excalidrawAPI.updateScene({ collaborators: new Map(collaborators) })
    })

    socket.on('user-left', (socketId: SocketId) => {
      collaborators.delete(socketId)
      excalidrawAPI.updateScene({ collaborators: new Map(collaborators) })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [boardId, excalidrawAPI])

  const emitScene = (elements: LocalElements) => {
    lastEmitAt.current = Date.now()
    socketRef.current?.emit('scene-update', boardId, elements)
  }

  const broadcastScene = (elements: LocalElements) => {
    const version = hashElementsVersion(elements)

    if (version === lastSyncedVersion.current) return

    lastSyncedVersion.current = version
    clearTimeout(trailingEmit.current)

    const wait = BROADCAST_THROTTLE_MS - (Date.now() - lastEmitAt.current)

    if (wait <= 0) emitScene(elements)
    else trailingEmit.current = setTimeout(() => emitScene(elements), wait)
  }

  const broadcastPointer = (payload: PointerPayload) => {
    socketRef.current?.emit('pointer-update', boardId, {
      username: getUsername() ?? 'Guest',
      pointer: payload.pointer,
      button: payload.button,
    } satisfies Collaborator)
  }

  return { broadcastScene, broadcastPointer }
}

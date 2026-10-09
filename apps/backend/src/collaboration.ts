import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'

// Pure relay: clients join a room per board and the server forwards scene and
// pointer updates to everyone else in it. Merging happens client-side via
// Excalidraw's reconcileElements, so the server never inspects payloads.
export const attachCollaboration = (server: HttpServer) => {
  const io = new Server(server, { maxHttpBufferSize: 10e6 })

  io.on('connection', (socket) => {
    socket.on('join-board', (boardId: number) => {
      const room = `board:${boardId}`

      // One board per connection — announce the departure to any previous room
      for (const joined of socket.rooms) {
        if (joined === socket.id || joined === room) continue

        socket.leave(joined)
        socket.to(joined).emit('user-left', socket.id)
      }

      socket.join(room)
    })

    socket.on('scene-update', (boardId: number, elements: unknown) => {
      socket.to(`board:${boardId}`).emit('scene-update', elements)
    })

    socket.on('pointer-update', (boardId: number, collaborator: unknown) => {
      socket.to(`board:${boardId}`).emit('pointer-update', socket.id, collaborator)
    })

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) socket.to(room).emit('user-left', socket.id)
      }
    })
  })
}

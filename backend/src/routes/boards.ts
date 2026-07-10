import { Router, Request, Response, NextFunction } from 'express'
import { eq, like, desc } from 'drizzle-orm'
import { ZipArchive } from 'archiver'
import { db } from '../db'
import { boards as boardsTable } from '../db/schema'

const router = Router()

const sanitizeFilename = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'board'

// Matches the shape produced by Excalidraw's own serializeAsJSON, so the files
// can be opened directly in Excalidraw
const toExcalidrawFile = (boardData: any) =>
  JSON.stringify(
    {
      type: 'excalidraw',
      version: 2,
      source: 'excalihome',
      elements: boardData?.elements ?? [],
      appState: boardData?.appState ?? {},
      files: boardData?.files ?? {},
    },
    null,
    2,
  )

// GET /api/v1/boards
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query

    const rows = db
      .select({
        id: boardsTable.id,
        name: boardsTable.name,
        pinned: boardsTable.pinned,
        createdAt: boardsTable.createdAt,
        updatedAt: boardsTable.updatedAt,
      })
      .from(boardsTable)
      .where(search ? like(boardsTable.name, `%${search as string}%`) : undefined)
      .orderBy(desc(boardsTable.updatedAt))
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/boards/export
router.get('/export', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db.select({ name: boardsTable.name, boardData: boardsTable.boardData }).from(boardsTable).all()

    if (rows.length === 0) return res.status(404).json({ error: 'There are no boards to export' })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="excalihome-export.zip"')

    const archive = new ZipArchive()
    archive.on('error', next)
    archive.pipe(res)

    const usedNames = new Map<string, number>()

    for (const board of rows) {
      const base = sanitizeFilename(board.name)
      const count = (usedNames.get(base) ?? 0) + 1
      usedNames.set(base, count)

      archive.append(toExcalidrawFile(board.boardData), { name: `${count === 1 ? base : `${base} (${count})`}.excalidraw` })
    }

    archive.finalize()
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/boards/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const board = db.select().from(boardsTable).where(eq(boardsTable.id, id)).get()

    if (!board) return res.status(404).json({ error: 'Board not found' })

    res.json(board)
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/boards
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, boardData } = req.body ?? {}

    const [board] = db
      .insert(boardsTable)
      .values({
        name: name?.trim() || 'New board',
        boardData: boardData ?? { elements: [] },
      })
      .returning()
      .all()

    res.status(201).json(board)
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/boards/import
router.post('/import', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { files } = req.body ?? {}

    if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ error: 'files must be a non-empty array' })

    const values = []

    for (const file of files) {
      const name = typeof file?.name === 'string' ? file.name.trim() : ''

      if (!name) return res.status(400).json({ error: 'Each file needs a name' })

      let parsed: any
      try {
        parsed = JSON.parse(file.contents)
      } catch {
        parsed = null
      }

      if (parsed?.type !== 'excalidraw' || !Array.isArray(parsed.elements)) {
        return res.status(400).json({ error: `"${name}" is not a valid .excalidraw file` })
      }

      values.push({
        name,
        boardData: {
          elements: parsed.elements.filter((element: any) => !element?.isDeleted),
          // Same appState subset the board editor persists
          appState: {
            viewBackgroundColor: parsed.appState?.viewBackgroundColor,
            gridModeEnabled: parsed.appState?.gridModeEnabled,
          },
          files: parsed.files ?? {},
        },
      })
    }

    const created = db.insert(boardsTable).values(values).returning().all()

    res.status(201).json(created.map(({ boardData, ...summary }) => summary))
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/boards/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const existing = db
      .select({ id: boardsTable.id, updatedAt: boardsTable.updatedAt })
      .from(boardsTable)
      .where(eq(boardsTable.id, id))
      .get()

    if (!existing) return res.status(404).json({ error: 'Board not found' })

    const body = req.body
    const patch: Record<string, any> = {}
    if (body.name !== undefined) {
      if (!body.name?.trim()) return res.status(400).json({ error: 'Name cannot be empty' })
      patch.name = body.name.trim()
    }
    if (body.boardData !== undefined) patch.boardData = body.boardData

    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' })

    // Only content changes count as activity — metadata-only updates keep the recency order
    if (body.boardData === undefined) patch.updatedAt = existing.updatedAt

    const [board] = db.update(boardsTable).set(patch).where(eq(boardsTable.id, id)).returning().all()

    res.json(board)
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/boards/:id/pin
router.put('/:id/pin', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const existing = db
      .select({ id: boardsTable.id, updatedAt: boardsTable.updatedAt })
      .from(boardsTable)
      .where(eq(boardsTable.id, id))
      .get()

    if (!existing) return res.status(404).json({ error: 'Board not found' })

    const { pinned } = req.body ?? {}

    if (typeof pinned !== 'boolean') return res.status(400).json({ error: 'pinned must be a boolean' })

    // Pass updatedAt through so $onUpdate doesn't bump it — pinning shouldn't reorder recents
    const [board] = db
      .update(boardsTable)
      .set({ pinned, updatedAt: existing.updatedAt })
      .where(eq(boardsTable.id, id))
      .returning()
      .all()

    res.json(board)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/boards
router.delete('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    db.delete(boardsTable).run()

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/boards/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const existing = db.select({ id: boardsTable.id }).from(boardsTable).where(eq(boardsTable.id, id)).get()

    if (!existing) return res.status(404).json({ error: 'Board not found' })

    db.delete(boardsTable).where(eq(boardsTable.id, id)).run()

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router

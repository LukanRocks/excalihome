import { Router, Request, Response, NextFunction } from 'express'
import { eq, like, desc } from 'drizzle-orm'
import { db } from '../db'
import { boards as boardsTable } from '../db/schema'

const router = Router()

// GET /api/v1/boards
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query

    const rows = db
      .select({
        id: boardsTable.id,
        name: boardsTable.name,
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

// PUT /api/v1/boards/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)

    const existing = db.select({ id: boardsTable.id }).from(boardsTable).where(eq(boardsTable.id, id)).get()

    if (!existing) return res.status(404).json({ error: 'Board not found' })

    const body = req.body
    const patch: Record<string, any> = {}
    if (body.name !== undefined) {
      if (!body.name?.trim()) return res.status(400).json({ error: 'Name cannot be empty' })
      patch.name = body.name.trim()
    }
    if (body.boardData !== undefined) patch.boardData = body.boardData

    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' })

    const [board] = db.update(boardsTable).set(patch).where(eq(boardsTable.id, id)).returning().all()

    res.json(board)
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

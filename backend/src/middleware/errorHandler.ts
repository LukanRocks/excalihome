import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack ?? err.message)

  if (err.message.includes('UNIQUE constraint failed')) {
    res.status(409).json({ error: 'A record with this value already exists' })
    return
  }

  const status = (err as any).status ?? 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}

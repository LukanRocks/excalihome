import express from 'express'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { runMigrations } from './db'
import { errorHandler } from './middleware/errorHandler'
import boardsRouter from './routes/boards'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

app.set('trust proxy', 1)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))
app.use(express.json({ limit: '10mb' }))

// API routes
app.use('/api/v1/boards', boardsRouter)

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'public')

  app.use(express.static(clientDist))
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}

app.use(errorHandler)

runMigrations()

app.listen(PORT, () => {console.log(`Excalihome server running on http://localhost:${PORT}`)})

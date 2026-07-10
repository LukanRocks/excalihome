import { useRef, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Download, Upload } from 'lucide-react'

import { Button } from '@/lib/components/button'
import { api } from '@/lib/http-transport/api'
import { clearTheme } from '@/lib/theme'
import { clearUsername, getUsername, setUsername } from '@/lib/username'
import { downloadFile } from '@/lib/utils'

export default function Settings() {
  const navigate = useNavigate()

  const [name, setName] = useState(() => getUsername() ?? '')
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const selected = Array.from(input.files ?? [])

    input.value = '' // Allow re-selecting the same files later

    if (selected.length === 0) return

    setImporting(true)
    try {
      const files = await Promise.all(
        selected.map(async (file) => ({
          name: file.name.replace(/\.excalidraw$/i, ''),
          contents: await file.text(),
        })),
      )

      await api.boards.import(files)

      // The shell refetches the board list on navigation, so the imports show up right away
      navigate('/')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to import boards. Please try again.')
      setImporting(false)
    }
  }

  const handleExportAll = async () => {
    setExporting(true)
    try {
      downloadFile('excalihome-export.zip', await api.boards.exportAll())
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to export boards. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all boards and local settings? This cannot be undone.')) return

    setDeleting(true)
    try {
      await api.boards.deleteAll()

      clearUsername()
      clearTheme()

      window.location.href = '/'
    } catch {
      setDeleting(false)
      window.alert('Failed to delete data. Please try again.')
    }
  }

  const trimmed = name.trim()
  const dirty = trimmed !== (getUsername() ?? '')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    if (!trimmed) return

    setUsername(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className='flex flex-col gap-4 p-2'>
      <h1 className='text-lg font-semibold tracking-tight text-foreground'>Settings</h1>

      <div className='max-w-md rounded-xl border border-border bg-card p-4'>
        <h2 className='text-sm font-medium text-card-foreground'>Profile</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>Shown to others when collaborating on a board</p>

        <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
          <div>
            <label htmlFor='username' className='mb-1.5 block text-sm font-medium text-foreground'>
              Your name
            </label>
            <input
              id='username'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. personal computer, or phone'
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none'
            />
          </div>

          <Button type='submit' disabled={!trimmed || !dirty}>
            {saved ? (
              <>
                Saved <Check />
              </>
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </div>

      <div className='max-w-md rounded-xl border border-border bg-card p-4'>
        <h2 className='text-sm font-medium text-card-foreground'>Import</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>Import one or more .excalidraw files. Each file becomes a board named after the file.</p>

        <input ref={fileInput} type='file' accept='.excalidraw' multiple hidden onChange={handleImport} />

        <Button variant='outline' disabled={importing} onClick={() => fileInput.current?.click()} className='mt-4'>
          {importing ? (
            'Importing…'
          ) : (
            <>
              Import boards <Upload />
            </>
          )}
        </Button>
      </div>

      <div className='max-w-md rounded-xl border border-border bg-card p-4'>
        <h2 className='text-sm font-medium text-card-foreground'>Export</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>Download each board as an .excalidraw file that can be opened in Excalidraw.</p>

        <Button variant='outline' disabled={exporting} onClick={handleExportAll} className='mt-4'>
          {exporting ? (
            'Exporting…'
          ) : (
            <>
              Export all boards <Download />
            </>
          )}
        </Button>
      </div>

      <div className='max-w-md rounded-xl border border-destructive/50 bg-card p-4'>
        <h2 className='text-sm font-medium text-destructive'>Danger zone</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>Permanently delete all boards and local settings, including your name. You will be taken back to onboarding.</p>

        <Button variant='destructive' disabled={deleting} onClick={handleDeleteAll} className='mt-4'>
          {deleting ? 'Deleting…' : 'Delete all data'}
        </Button>
      </div>
    </div>
  )
}

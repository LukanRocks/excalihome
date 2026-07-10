import { useRef, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Download, Upload } from 'lucide-react'

import { Button } from '@/lib/components/button'
import { api } from '@/lib/http-transport/api'
import { clearTheme } from '@/lib/theme'
import { clearUsername, getUsername, setUsername } from '@/lib/username'

const downloadFile = (filename: string, contents: Blob) => {
  const url = URL.createObjectURL(contents)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

export default function Settings() {
  const [name, setName] = useState(() => getUsername() ?? '')
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        <h2 className='text-sm font-medium text-card-foreground'>Export</h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          Download each board as an .excalidraw file that can be opened in Excalidraw.
        </p>

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
        <p className='mt-0.5 text-xs text-muted-foreground'>
          Permanently delete all boards and local settings, including your name. You will be taken back to onboarding.
        </p>

        <Button variant='destructive' disabled={deleting} onClick={handleDeleteAll} className='mt-4'>
          {deleting ? 'Deleting…' : 'Delete all data'}
        </Button>
      </div>
    </div>
  )
}

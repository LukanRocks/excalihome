import { useState, type SubmitEvent } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/lib/components/button'
import { getUsername, setUsername } from '@/lib/username'

export default function Settings() {
  const [name, setName] = useState(() => getUsername() ?? '')
  const [saved, setSaved] = useState(false)

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
    </div>
  )
}

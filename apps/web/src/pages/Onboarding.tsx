import { useState, type SubmitEvent } from 'react'
import { ChevronRight, UserRound } from 'lucide-react'

import { Button } from '@/lib/components/button'
import { setUsername } from '@/lib/username'

export default function Onboarding({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) return

    setUsername(trimmed)
    onComplete(trimmed)
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12'>
      <div className='w-full max-w-md'>
        <div className='mb-10 text-center'>
          <h1 className='text-3xl font-bold text-foreground'>Welcome to Excalihome</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Pick a name for this device to get started.</p>
        </div>

        <div className='rounded-2xl border border-border bg-card p-8'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
              <UserRound size={20} className='text-primary' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>Who are you?</h2>
              <p className='text-xs text-muted-foreground'>Shown to others when collaborating on a board</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-foreground'>Your name</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. personal computer, or phone'
                autoFocus
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none'
              />
            </div>

            <Button type='submit' disabled={!name.trim()} className='w-full'>
              Continue <ChevronRight />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

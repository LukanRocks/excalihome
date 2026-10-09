import { Input } from '@base-ui/react/input'
import { SearchIcon } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const SearchInput = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const q = (new FormData(event.currentTarget).get('q') as string).trim()

    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  return (
    <form onSubmit={onSubmit} className='relative w-full max-w-xs'>
      <SearchIcon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='search'
        name='q'
        defaultValue={searchParams.get('q') ?? ''}
        placeholder='Search boards…'
        className='h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
      />
    </form>
  )
}

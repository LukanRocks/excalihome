import { ReactNode } from 'react'

interface NavGroupProps {
  title: string
  children: ReactNode
}

export const NavGroup = ({ title,  children }: NavGroupProps) => (
  <nav className={'flex flex-col gap-1'}>
    <p className='px-2 py-1 text-xs font-medium text-muted-foreground'>{title}</p>
    <div className='flex flex-col gap-0.5'>{children}</div>
  </nav>
)

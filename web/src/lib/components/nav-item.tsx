import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { Menu } from '@base-ui/react/menu'
import { Ellipsis } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface NavItemAction {
  icon: ReactNode
  label: string
  action: () => void
  destructive?: boolean
}

interface NavItemProps {
  to: string
  end?: boolean
  icon: ReactNode
  actions?: NavItemAction[]
  children: ReactNode
}

export const NavItem = ({ to, end, icon, actions, children }: NavItemProps) => (
  <div className='group relative'>
    <NavLink
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground',
          '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          actions?.length && 'group-hover:pr-7 group-has-data-popup-open:pr-7',
        )
      }
      to={to}
      end={end}
    >
      {icon}
      <span className='truncate'>{children}</span>
    </NavLink>
    {!!actions?.length && (
      <div className='absolute right-2 top-1/2 hidden -translate-y-1/2 group-hover:flex group-has-data-popup-open:flex'>
        <Menu.Root>
          <Menu.Trigger className='flex size-4 items-center justify-center text-muted-foreground hover:text-sidebar-accent-foreground data-popup-open:text-sidebar-accent-foreground [&_svg]:size-4'>
            <Ellipsis />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align='end' sideOffset={6} className='z-50'>
              <Menu.Popup className='min-w-36 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md'>
                {actions.map(({ icon, label, action, destructive }) => (
                  <Menu.Item
                    className={cn(
                      'flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
                      destructive && 'text-destructive data-highlighted:text-destructive',
                    )}
                    key={label}
                    onClick={action}
                  >
                    {icon}
                    {label}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    )}
  </div>
)

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Bell, User, LogOut, Plus, Home, ClipboardList, Sparkles, Menu } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface HeaderProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
    }
  } | null
  notificationCount?: number
  isAdmin?: boolean
}

export function Header({ user, notificationCount = 0, isAdmin = false }: HeaderProps) {
  const pathname = usePathname()

  const navItems = isAdmin 
    ? [
        { href: '/admin', label: 'Dashboard', icon: Home },
        { href: '/admin/items', label: 'Items', icon: ClipboardList },
        { href: '/admin/claims', label: 'Claims', icon: ClipboardList },
      ]
    : [
        { href: '/dashboard', label: 'Browse', icon: Home },
        { href: '/dashboard/my-claims', label: 'My Claims', icon: ClipboardList },
        { href: '/dashboard/report', label: 'Report Found', icon: Plus },
      ]

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="border-b border-border/50 bg-card/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-foreground tracking-tight">Lost & Found</span>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Campus Recovery System</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-border">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                <div className="px-3 py-2 bg-gradient-to-br from-secondary to-accent/10 rounded-t-lg -m-1 mb-1">
                  <p className="text-sm font-semibold">{user?.user_metadata?.full_name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Home className="w-4 h-4 mr-2" />
                        Student View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer focus:text-destructive"
                  onClick={() => signout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

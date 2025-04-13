'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  Ticket, 
  Inbox, 
  Settings, 
  Users, 
  BarChart, 
  Tag,
  Star,
  Pin,
  Bell,
  User,
  LogOut,
  Languages
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationsModal } from '@/components/shared/NotificationsModal'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userRole?: 'customer' | 'operator' | 'admin'
  footerNavItems?: NavigationItem[]
  notificationCount?: number
}

interface NavigationItem {
  title: string
  href: string
  icon: any
}

export function Sidebar({
  className,
  userRole = 'customer',
  footerNavItems,
  notificationCount = 0,
  ...props
}: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  // Bildirim zil simgesine tıklandığında
  const handleNotificationClick = () => {
    setNotificationsOpen(true)
  }
  
  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = (id: string) => {
    console.log('Bildirim okundu:', id)
    // Gerçek uygulamada bildirim API'sine istek gönderilebilir
  }
  
  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = () => {
    console.log('Tüm bildirimler okundu olarak işaretlendi')
    // Gerçek uygulamada bildirim API'sine istek gönderilebilir
  }

  // Çıkış işlemi
  const handleLogout = () => {
    logout()
  }

  // Kullanıcı rolüne göre navigasyon öğeleri
  const getNavigationItems = () => {
    if (userRole === 'customer') {
      return [
        {
          title: t('nav.dashboard'),
          href: '/customer',
          icon: LayoutDashboard,
        },
        {
          title: t('nav.myTickets'),
          href: '/customer/tickets',
          icon: Ticket,
        },
        {
          title: t('nav.profile'),
          href: '/customer/profile',
          icon: Users,
        },
      ]
    } else if (userRole === 'operator') {
      return [
        {
          title: t('nav.dashboard'),
          href: '/operator',
          icon: LayoutDashboard,
        },
        {
          title: t('nav.inbox'),
          href: '/operator/inbox',
          icon: Inbox,
        },
        {
          title: t('tickets.myTickets'),
          href: '/operator/my-tickets',
          icon: Ticket,
        },
        {
          title: t('tickets.categories'),
          href: '/operator/categories',
          icon: Tag,
        },
      ]
    } else {
      return [
        {
          title: t('nav.dashboard'),
          href: '/admin',
          icon: LayoutDashboard,
        },
        {
          title: t('nav.tickets'),
          href: '/admin/tickets',
          icon: Ticket,
        },
        {
          title: t('nav.users'),
          href: '/admin/users',
          icon: Users,
        },
        {
          title: t('nav.reports'),
          href: '/admin/reports',
          icon: BarChart,
        },
        {
          title: t('nav.settings'),
          href: '/admin/settings',
          icon: Settings,
        },
      ]
    }
  }
  
  const navigationItems = getNavigationItems()
  
  // Favoriler (demo)
  const favoriteItems = userRole !== 'customer' ? [
    {
      title: t('tickets.statusTypes.pending'),
      href: `/${userRole}/tickets?status=pending`,
      icon: Star,
    },
    {
      title: t('tickets.priorityTypes.high'),
      href: `/${userRole}/tickets?priority=high`,
      icon: Star,
    },
  ] : []
  
  // Sabitlenen biletler (demo)
  const pinnedTickets = userRole !== 'customer' ? [
    {
      title: '#1001 - ' + t('tickets.priorityTypes.high'),
      href: `/${userRole}/tickets/1001`,
      icon: Pin,
    },
    {
      title: '#1003 - ' + t('tickets.priorityTypes.medium'),
      href: `/${userRole}/tickets/1003`,
      icon: Pin,
    },
  ] : []

  return (
    <aside 
      className={cn("flex flex-col w-60 border-r bg-background", className)}
      {...props}
    >
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold">
          {t('app.title')}
        </h2>
      </div>
      
      <div className="flex-1 px-4 space-y-4">
        <nav className="flex flex-col space-y-1">
          {navigationItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        
        {favoriteItems.length > 0 && (
          <>
            <h3 className="text-sm font-medium ml-2 mt-6 text-muted-foreground">
              {t('nav.favorites')}
            </h3>
            <nav className="flex flex-col space-y-1">
              {favoriteItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </>
        )}
        
        {pinnedTickets.length > 0 && (
          <>
            <h3 className="text-sm font-medium ml-2 mt-6 text-muted-foreground">
              {t('nav.pinned')}
            </h3>
            <nav className="flex flex-col space-y-1">
              {pinnedTickets.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
      
      {/* Sidebar Footer - Eski Header işlevselliği */}
      <div className="mt-auto border-t">
        <div className="px-4 py-4">
          {/* Kullanıcı Bilgisi */}
          {user && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.username || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* İşlevsel Butonlar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Bildirimler */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground relative h-8 w-8"
                onClick={handleNotificationClick}
              >
                <Bell size={16} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
              
              {/* Tema ve Dil Değiştirici */}
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            
            {/* Ayarlar Menüsü */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                    <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('account.settings')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('account.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('account.preferences')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('account.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bildirimler Modalı */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </aside>
  )
}

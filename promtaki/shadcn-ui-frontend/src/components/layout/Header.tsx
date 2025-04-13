import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, Search, User, LogOut } from 'lucide-react'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { useTranslation } from 'react-i18next'
import { NotificationsModal } from '@/components/shared/NotificationsModal'

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  title?: string
  showSearch?: boolean
  notificationCount?: number
  onNotificationClick?: () => void
  onSearchClick?: () => void
}

export function Header({
  className,
  title = 'Dashboard',
  showSearch = false,
  notificationCount = 3, // Varsayılan bildirim sayısı
  onNotificationClick,
  onSearchClick,
  ...props
}: HeaderProps) {
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Bildirim zil simgesine tıklandığında
  const handleNotificationClick = () => {
    setNotificationsOpen(true);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };
  
  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = (id: string) => {
    console.log('Bildirim okundu:', id);
    // Gerçek uygulamada bildirim API'sine istek gönderilebilir
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = () => {
    console.log('Tüm bildirimler okundu olarak işaretlendi');
    // Gerçek uygulamada bildirim API'sine istek gönderilebilir
  };
  
  return (
    <header className={cn("border-b bg-background", className)} {...props}>
      <div className="px-5 h-16 flex items-center justify-between">
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={onSearchClick}
            >
              <Search size={18} />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground relative"
            onClick={handleNotificationClick}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Settings size={18} />
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
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('account.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </header>
  )
}

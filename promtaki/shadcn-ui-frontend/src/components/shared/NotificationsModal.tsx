'use client'

import React, { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import {
  Filter,
  Maximize2,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

type NotificationType = 'mention' | 'reply' | 'assignment' | 'status' | 'like' | 'comment'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Notification {
  id: string
  type: NotificationType
  content: string
  date: string
  read: boolean
  user: User
  ticketId?: string
}

export function NotificationsModal({
  open,
  onOpenChange,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsModalProps) {
  const { t, i18n } = useTranslation()
  
  // Sayfalama ve yükleme durumu
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'mention',
      content: 'Mention you in comment conversation ticket',
      date: new Date().toISOString(),
      read: false,
      user: {
        id: '1',
        name: 'Martin Smith',
        email: 'martin@example.com',
      },
      ticketId: 'TC-192'
    },
    {
      id: '2',
      type: 'assignment',
      content: 'Assigned in Number Ticket',
      date: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 saat önce
      read: false,
      user: {
        id: '2',
        name: 'Grant Hayes',
        email: 'grant@example.com',
      },
      ticketId: 'TC-192'
    },
    {
      id: '3',
      type: 'reply',
      content: 'Sure, the order number is',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
      read: true,
      user: {
        id: '3',
        name: 'Santi Cazorla',
        email: 'santi@example.com',
      },
      ticketId: 'TC-192'
    },
    {
      id: '4',
      type: 'status',
      content: 'Change type Ticket to',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
      read: true,
      user: {
        id: '4',
        name: 'Darlene Robertson',
        email: 'darlene@example.com',
      },
      ticketId: 'TC-191'
    }
  ]);
  
  // Daha fazla bildirim yükleme
  const loadMoreNotifications = () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Yapay bir gecikme (gerçek uygulamada bir API çağrısı olacak)
    setTimeout(() => {
      const newNotifications: Notification[] = [
        {
          id: `new-${page}-1`,
          type: 'comment',
          content: 'Added a comment on your ticket',
          date: new Date(Date.now() - (page + 3) * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          user: {
            id: '5',
            name: 'Xavi Hernandez',
            email: 'xavi@example.com',
          },
          ticketId: 'TC-191'
        },
        {
          id: `new-${page}-2`,
          type: 'like',
          content: 'Liked your comment',
          date: new Date(Date.now() - (page + 4) * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          user: {
            id: '6',
            name: 'Santi Cazorla',
            email: 'santi@example.com',
          },
          ticketId: 'TC-192'
        }
      ];
      
      // 3 sayfa sonra daha fazla bildirim olmadığını simüle et
      if (page >= 3) {
        setHasMore(false);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
        setPage(prev => prev + 1);
      }
      
      setLoading(false);
    }, 1000);
  };
  
  // Tarih formatlama için dil ayarı
  const getDateLocale = () => {
    return i18n.language === 'tr' ? tr : enUS
  }
  
  // Bildirim türüne göre başlık oluşturma
  const getNotificationTitle = (notification: Notification) => {
    const { type, user, ticketId } = notification
    
    switch (type) {
      case 'mention':
        return `${user.name} mentioned you in a comment ${ticketId}`
      case 'reply':
        return `${user.name} replied to your comment`
      case 'assignment':
        return `${user.name} assigned a ticket to you ${ticketId}`
      case 'status':
        return `${user.name} changed the status of ticket ${ticketId}`
      case 'like':
        return `${user.name} liked your comment`
      case 'comment':
        return `${user.name} commented on your ticket ${ticketId}`
      default:
        return `New notification from ${user.name}`
    }
  };
  
  // İsimden baş harfler oluşturma
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Virtual list için ref
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Virtual list oluşturma
  const virtualizer = useVirtualizer({
    count: notifications.length + (hasMore ? 1 : 0), // +1 for load more row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // yaklaşık bildirim yüksekliği
    overscan: 5,
  });
  
  return (
    <>
      {/* Arkaplanı karartma - sidebar dışında */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 transition-opacity sm:ml-[240px]"
          style={{ zIndex: 30 }}
          onClick={() => onOpenChange?.(false)}
        />
      )}
      
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent 
          className="sm:max-w-[500px] flex flex-col fixed w-[90vw] border bg-background shadow-lg p-0 [&>button]:hidden"
          style={{ 
            maxWidth: '500px', 
            top: '95%',
            left: 'calc(var(--sidebar-width, 440px) + 3rem)', 
            marginLeft: '20px', 
            transform: 'translateY(-50%)',
            maxHeight: 'calc(100vh - 4rem)', 
            height: 'calc(100vh - 6rem)', 
            zIndex: 50 
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b">
            <DialogTitle className="text-lg">{t('notifications.title')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('notifications.aria-description', 'View and manage your notifications')}
            </DialogDescription>
            <div className="flex items-center space-x-3">
              <Maximize2 className="h-4 w-4 text-muted-foreground cursor-pointer" />
              <X 
                className="h-4 w-4 text-muted-foreground cursor-pointer" 
                onClick={() => onOpenChange(false)}
              />
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-between p-4 pb-2">
            <span className="text-muted-foreground cursor-pointer">
              <Filter className="h-4 w-4" />
            </span>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onMarkAllAsRead}>
              {t('notifications.markAllAsRead')}
            </Button>
          </div>
          
          <div 
            ref={parentRef}
            className="overflow-auto flex-1"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                // "Load More" öğesi
                if (hasMore && virtualItem.index === notifications.length) {
                  return (
                    <div
                      key="load-more"
                      className="py-4 flex justify-center"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {loading ? (
                        <div className="w-full p-4">
                          <div className="flex items-start space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2 mb-2" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={loadMoreNotifications}
                          className="text-xs text-muted-foreground"
                        >
                          {t('notifications.loadMore')}
                        </Button>
                      )}
                    </div>
                  );
                }
                
                // Normal bildirim öğesi
                const notification = notifications[virtualItem.index];
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 border-b last:border-0 relative ${notification.read ? 'opacity-80' : ''}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* İsmin baş harfleri */}
                      <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold text-muted-foreground">
                        {getInitials(notification.user.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium pr-6">
                            {getNotificationTitle(notification)}
                          </div>
                          
                          {/* Okunmadı işareti (sağda) */}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center pt-1 mt-1">
                          <time className="text-xs text-muted-foreground" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(notification.date), {
                              addSuffix: true,
                              locale: getDateLocale()
                            })}
                          </time>
                          
                          {notification.ticketId && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {notification.ticketId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">{t('notifications.empty')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

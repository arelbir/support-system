import React from 'react'
import { BaseLayout } from './BaseLayout'
import { Sidebar } from './Sidebar'
import { 
  LayoutDashboard, Inbox, Ticket, Users, BookOpen, 
  Bell, Settings, AlarmClock, Tags, MessageSquare 
} from 'lucide-react'

interface OperatorLayoutProps {
  children: React.ReactNode
  title?: string
  notificationCount?: number
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const navItems = [
  { title: 'Kontrol Paneli', href: '/operator', icon: <LayoutDashboard size={18} /> },
  { title: 'Gelen Kutusu', href: '/operator/inbox', icon: <Inbox size={18} /> },
  { title: 'Bilet Kuyruğu', href: '/operator/queue', icon: <Ticket size={18} /> },
  { title: 'SLA İzleme', href: '/operator/sla', icon: <AlarmClock size={18} /> },
  { title: 'Bilgi Bankası', href: '/operator/knowledge-base', icon: <BookOpen size={18} /> },
  { title: 'Müşteriler', href: '/operator/customers', icon: <Users size={18} /> },
  { title: 'Etiketler', href: '/operator/tags', icon: <Tags size={18} /> },
  { title: 'Hazır Yanıtlar', href: '/operator/canned-responses', icon: <MessageSquare size={18} /> },
]

const footerNavItems = [
  { title: 'Bildirimler', href: '/operator/notifications', icon: <Bell size={18} /> },
  { title: 'Ayarlar', href: '/operator/settings', icon: <Settings size={18} /> },
]

export function OperatorLayout({
  children,
  title = 'Operatör Paneli',
  notificationCount = 0,
  user,
}: OperatorLayoutProps) {
  const [showNotifications, setShowNotifications] = React.useState(false)
  
  return (
    <BaseLayout
      title={title}
      notificationCount={notificationCount}
      onNotificationClick={() => setShowNotifications(!showNotifications)}
      sidebar={
        <Sidebar
          items={navItems}
          footerNavItems={footerNavItems}
          user={user}
        />
      }
    >
      {children}
      
      {/* Bildirim paneli */}
      {showNotifications && (
        <div className="fixed right-0 top-14 w-80 h-[calc(100vh-3.5rem)] border-l bg-background z-10">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Bildirimler</h2>
          </div>
          <div className="p-4">
            {notificationCount > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-4">
                  {notificationCount} yeni bildiriminiz var
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium">Yeni SLA uyarısı</div>
                  <div className="text-sm text-muted-foreground">Bilet #1234 için SLA süreniz azalıyor</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium">Yeni atama</div>
                  <div className="text-sm text-muted-foreground">Size yeni bir bilet atandı: #5678</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Yeni bildiriminiz bulunmuyor
              </div>
            )}
          </div>
        </div>
      )}
    </BaseLayout>
  )
}

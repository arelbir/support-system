import React from 'react'
import { BaseLayout } from './BaseLayout'
import { Sidebar } from './Sidebar'
import { 
  LayoutDashboard, Users, Settings, FileCog, LineChart,
  Bell, Shield, History, CircleDollarSign, Database 
} from 'lucide-react'

interface AdminLayoutProps {
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
  { title: 'Kontrol Paneli', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { title: 'Kullanıcı Yönetimi', href: '/admin/users', icon: <Users size={18} /> },
  { title: 'Durum Ayarları', href: '/admin/statuses', icon: <FileCog size={18} /> },
  { title: 'SLA Ayarları', href: '/admin/sla', icon: <CircleDollarSign size={18} /> },
  { title: 'Raporlar', href: '/admin/reports', icon: <LineChart size={18} /> },
  { title: 'Sistem Ayarları', href: '/admin/settings', icon: <Settings size={18} /> },
  { title: 'Denetim Kayıtları', href: '/admin/audit-logs', icon: <History size={18} /> },
]

const footerNavItems = [
  { title: 'Bildirimler', href: '/admin/notifications', icon: <Bell size={18} /> },
  { title: 'Güvenlik', href: '/admin/security', icon: <Shield size={18} /> },
  { title: 'Veri Yönetimi', href: '/admin/data', icon: <Database size={18} /> },
]

export function AdminLayout({
  children,
  title = 'Yönetici Paneli',
  notificationCount = 0,
  user,
}: AdminLayoutProps) {
  const [showNotifications, setShowNotifications] = React.useState(false)
  
  return (
    <BaseLayout
      title={title}
      notificationCount={notificationCount}
      onNotificationClick={() => setShowNotifications(!showNotifications)}
      sidebar={
        <Sidebar
          className="border-r bg-muted/10"
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
                  <div className="font-medium">Sistem Uyarısı</div>
                  <div className="text-sm text-muted-foreground">
                    Lisans süreniz 10 gün içinde dolacak
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium">Kullanıcı Etkinliği</div>
                  <div className="text-sm text-muted-foreground">
                    Yeni operatör hesabı oluşturuldu
                  </div>
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

import React from 'react'
import { BaseLayout } from './BaseLayout'
import { Sidebar } from './Sidebar'
import { Ticket, Home, MessageSquare, BookOpen, Bell, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CustomerLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  notificationCount?: number
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function CustomerLayout({
  children,
  title = 'Müşteri Paneli',
  subtitle,
  actions,
  notificationCount = 0,
  user,
}: CustomerLayoutProps) {
  const { t } = useTranslation();
  
  // Alt navigasyon öğeleri
  const footerNavItems = [
    { title: t('nav.settings'), href: '/customer/settings', icon: <Settings size={18} /> },
  ];
  
  return (
    <BaseLayout
      notificationCount={notificationCount}
      sidebar={
        <Sidebar
          userRole="customer"
          footerNavItems={footerNavItems}
          notificationCount={notificationCount}
        />
      }
    >
      <div className="col-span-12 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {(title || subtitle || actions) && (
            <div className="flex justify-between items-center w-full">
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div>{actions}</div>}
            </div>
          )}
        </div>
        <div className="col-span-12">
          {children}
        </div>
      </div>
    </BaseLayout>
  )
}

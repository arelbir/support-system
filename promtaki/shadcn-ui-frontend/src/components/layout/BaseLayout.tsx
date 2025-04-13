import React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  sidebar?: React.ReactNode
  notificationCount?: number
}

export function BaseLayout({
  children,
  className,
  sidebar,
  notificationCount = 0,
}: BaseLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      {sidebar}
      <div className="flex flex-col flex-1">
        <main className={cn("flex-1", className)}>
          <div className="grid grid-cols-12 gap-5 p-6 w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

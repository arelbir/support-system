'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Ticket, Bell, User } from 'lucide-react'

// Dashboard kart bileşeni
function DashboardCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  buttonText,
  buttonHref,
  variant = "default" 
}: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  buttonText: string;
  buttonHref: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantClasses = {
    default: "bg-card",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
  };
  
  const iconClasses = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };
  
  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full"
          onClick={() => window.location.href = buttonHref}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CustomerDashboard() {
  const user = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
  };
  
  return (
    <CustomerLayout
      title="Kontrol Paneli"
      user={user}
      notificationCount={3}
    >
      <div className="col-span-12 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz, {user.name}</h1>
          <Button onClick={() => window.location.href = '/customer/tickets/new'}>
            Yeni Talep Oluştur
          </Button>
        </div>
        
        <div className="grid gap-5 md:grid-cols-4">
          <DashboardCard
            title="Aktif Talepler"
            value={5}
            description="Açık durumda olan talepleriniz"
            icon={Ticket}
            buttonText="Talepleri Görüntüle"
            buttonHref="/customer/tickets"
            variant="success"
          />
          
          <DashboardCard
            title="Bekleyen Talepler"
            value={2}
            description="Yanıt bekleyen talepleriniz"
            icon={Ticket}
            buttonText="Talepleri Görüntüle"
            buttonHref="/customer/tickets?status=pending"
            variant="warning"
          />
          
          <DashboardCard
            title="Bildirimler"
            value={3}
            description="Okunmamış bildirimleriniz"
            icon={Bell}
            buttonText="Bildirimleri Görüntüle"
            buttonHref="/customer/notifications"
          />
          
          <DashboardCard
            title="Profil Bilgileri"
            value="Ayarlar"
            description="Hesap bilgilerinizi güncelleyin"
            icon={User}
            buttonText="Profili Düzenle"
            buttonHref="/customer/profile"
          />
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Son etkileşimde bulunduğunuz talepler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, title: 'Ödeme Sorunu', status: 'open', date: '12.04.2025', lastComment: 'Ödeme bilgilerinizi kontrol ediyoruz.' },
                { id: 2, title: 'Hesap Erişimi', status: 'pending', date: '10.04.2025', lastComment: 'Lütfen e-postanızı kontrol edin.' },
                { id: 3, title: 'Teknik Destek', status: 'closed', date: '05.04.2025', lastComment: 'Sorun çözüldü.' }
              ].map((activity) => (
                <div key={activity.id} className="flex justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.lastComment}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="font-medium">#{activity.id}</p>
                    <p className="text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  )
}

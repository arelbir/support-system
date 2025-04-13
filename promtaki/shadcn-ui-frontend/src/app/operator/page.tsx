'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Inbox,
  AlertCircle,
  Clock,
  Users,
  CheckCircle,
  LineChart,
  CalendarClock,
  Timer,
  AlertTriangle,
} from 'lucide-react'

// Stat kart bileşeni
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default"
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
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
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            <span className="text-muted-foreground ml-1">son 24 saat</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Bilet veya görev kartı
function TicketCard({
  id,
  subject,
  customer,
  priority,
  status,
  sla,
  createdAt,
}: {
  id: string;
  subject: string;
  customer: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'closed';
  sla?: {
    timeLeft: string;
    isOverdue: boolean;
  };
  createdAt: string;
}) {
  const priorityBadge = {
    low: <Badge variant="outline" className="bg-green-500/20 text-green-700">Düşük</Badge>,
    medium: <Badge variant="outline" className="bg-blue-500/20 text-blue-700">Orta</Badge>,
    high: <Badge variant="outline" className="bg-red-500/20 text-red-700">Yüksek</Badge>,
  };
  
  const statusBadge = {
    open: <Badge variant="outline" className="bg-green-500/20 text-green-700">Açık</Badge>,
    pending: <Badge variant="outline" className="bg-amber-500/20 text-amber-700">Beklemede</Badge>,
    closed: <Badge variant="outline" className="bg-gray-500/20 text-gray-700">Kapalı</Badge>,
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">
            <Link href={`/operator/inbox/${id}`} className="hover:underline">#{id}: {subject}</Link>
          </CardTitle>
          <div className="flex gap-2">
            {priorityBadge[priority]}
            {statusBadge[status]}
          </div>
        </div>
        <CardDescription className="flex items-center text-xs">
          <Users className="h-3 w-3 mr-1" />
          {customer}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {sla && (
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>SLA</span>
              <span className={sla.isOverdue ? "text-red-500" : "text-muted-foreground"}>
                {sla.timeLeft}
              </span>
            </div>
            <Progress value={sla.isOverdue ? 100 : 70} className={`h-1 ${sla.isOverdue ? "bg-red-500" : ""}`} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full justify-between items-center">
          <span className="text-xs text-muted-foreground">{createdAt}</span>
          <Button variant="ghost" size="sm">Yanıtla</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function OperatorDashboard() {
  const { t } = useTranslation()
  
  // Demo veriler
  const recentTickets = [
    {
      id: "193",
      subject: "Ürün iadesi nasıl yapılır?",
      customer: "Ahmet Yılmaz",
      priority: "medium" as const,
      status: "open" as const,
      sla: { timeLeft: "2s 30d", isOverdue: false },
      createdAt: "Bugün, 14:30",
    },
    {
      id: "192",
      subject: "Ödeme işlemi tamamlanmadı",
      customer: "Zeynep Kaya",
      priority: "high" as const,
      status: "open" as const,
      sla: { timeLeft: "30d", isOverdue: true },
      createdAt: "Bugün, 13:15",
    },
    {
      id: "191",
      subject: "Sipariş durumu hakkında bilgi",
      customer: "Mehmet Demir",
      priority: "low" as const,
      status: "pending" as const,
      sla: { timeLeft: "4s 10d", isOverdue: false },
      createdAt: "Dün, 16:42",
    }
  ]
  
  return (
    <OperatorLayout title={t('dashboard.operatorTitle', 'Operatör Kontrol Paneli')}>
      <div className="col-span-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Kontrol Paneli</h1>
        
        {/* Üst istatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Toplam Bekleyen Bilet"
            value="24"
            description="Yanıt bekleyen biletler"
            icon={Inbox}
            trend={{ value: 5, isPositive: false }}
            variant="default"
          />
          <StatCard
            title="SLA İhlali"
            value="3"
            description="Yanıt süresi aşılan biletler"
            icon={AlertCircle}
            trend={{ value: 12, isPositive: false }}
            variant="danger"
          />
          <StatCard
            title="Ortalama Yanıt Süresi"
            value="2s 14d"
            description="Son 24 saatte"
            icon={Clock}
            trend={{ value: 8, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Aktif Müşteriler"
            value="142"
            description="Son 7 günde"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            variant="default"
          />
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="my-tickets">Biletlerim</TabsTrigger>
            <TabsTrigger value="sla">SLA Durumu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sol kolon - Son Biletler */}
              <div className="col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Son Biletler</CardTitle>
                    <CardDescription>Son 24 saat içinde açılan biletler</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentTickets.map(ticket => (
                      <TicketCard key={ticket.id} {...ticket} />
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Tüm Biletleri Görüntüle
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Sağ kolon - Performans ve Hatırlatıcılar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performans</CardTitle>
                    <CardDescription>Son 7 günlük performansınız</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Çözülen Biletler</span>
                      </div>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm">İlk Yanıt Süresi</span>
                      </div>
                      <span className="font-medium">1s 22d</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm">Müşteri Memnuniyeti</span>
                      </div>
                      <span className="font-medium">92%</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full">
                      <LineChart className="h-4 w-4 mr-2" />
                      Detaylı Analiz
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Hatırlatıcılar</CardTitle>
                    <CardDescription>Yaklaşan görevler ve önemli hatırlatıcılar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">SLA İhlali Yaklaşıyor</h4>
                        <p className="text-xs text-muted-foreground">2 bilet için yanıt süresi yaklaşıyor (30 dakikadan az)</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CalendarClock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Ekip Toplantısı</h4>
                        <p className="text-xs text-muted-foreground">Bugün 16:00 - Haftalık performans değerlendirmesi</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="my-tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Biletlerim</CardTitle>
                <CardDescription>Size atanmış biletler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Şu anda size atanmış bilet bulunmuyor.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sla" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SLA Durumu</CardTitle>
                <CardDescription>Yanıt süresi ve çözüm süresi metrikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">İlk Yanıt SLA</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-green-500">8</div>
                          <div className="text-xs text-muted-foreground text-center">Hedef Dahilinde</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-amber-500">3</div>
                          <div className="text-xs text-muted-foreground text-center">Risk Altında</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-red-500">2</div>
                          <div className="text-xs text-muted-foreground text-center">İhlal Edildi</div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Çözüm Süresi SLA</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-green-500">12</div>
                          <div className="text-xs text-muted-foreground text-center">Hedef Dahilinde</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-amber-500">5</div>
                          <div className="text-xs text-muted-foreground text-center">Risk Altında</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="text-2xl font-bold text-red-500">1</div>
                          <div className="text-xs text-muted-foreground text-center">İhlal Edildi</div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Detaylı SLA Raporu
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  )
}

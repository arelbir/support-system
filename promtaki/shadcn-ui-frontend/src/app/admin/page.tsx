'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, AlertTriangle, ArrowUp, CheckCircle, Clock, Percent, TicketIcon, Users } from 'lucide-react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveLine } from '@nivo/line'
import { useTranslation } from 'react-i18next'

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  
  // Demo verileri
  const ticketStats = {
    total: 1248,
    open: 347,
    closed: 901,
    satisfaction: 92,
    responseTime: 1.4,
    slaViolations: 23
  }
  
  const userStats = {
    total: 578,
    operators: 14,
    admins: 3,
    newToday: 5
  }
  
  // Grafik verileri
  const ticketsByCategory = [
    { id: 'Teknik', value: 45 },
    { id: 'Fatura', value: 25 },
    { id: 'Ürün', value: 20 },
    { id: 'Diğer', value: 10 }
  ]
  
  const ticketTrend = [
    {
      id: 'tickets',
      data: [
        { x: 'Paz', y: 24 },
        { x: 'Pzt', y: 42 },
        { x: 'Sal', y: 39 },
        { x: 'Çar', y: 35 },
        { x: 'Per', y: 40 },
        { x: 'Cum', y: 37 },
        { x: 'Cmt', y: 28 }
      ]
    }
  ]
  
  const slaPerformance = [
    { category: 'Acil', met: 85, failed: 15 },
    { category: 'Yüksek', met: 92, failed: 8 },
    { category: 'Orta', met: 97, failed: 3 },
    { category: 'Düşük', met: 99, failed: 1 },
  ]
  
  return (
    <AdminLayout title="Yönetici Kontrol Paneli">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bilet İstatistikleri */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Bilet İstatistikleri</CardTitle>
              <CardDescription>Tüm zamanlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Toplam</span>
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{ticketStats.total}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Açık</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-bold">{ticketStats.open}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Kapanmış</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">{ticketStats.closed}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">SLA İhlali</span>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-2xl font-bold">{ticketStats.slaViolations}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Memnuniyet */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Müşteri Memnuniyeti</CardTitle>
              <CardDescription>Son 30 gün</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center pt-4">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{ticketStats.satisfaction}%</span>
                  <span className="text-xs text-muted-foreground">memnuniyet</span>
                </div>
                <ResponsivePie
                  data={[
                    { id: 'memnun', value: ticketStats.satisfaction, color: 'hsl(var(--primary))' },
                    { id: 'memnun değil', value: 100 - ticketStats.satisfaction, color: 'hsl(var(--muted))' }
                  ]}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  innerRadius={0.7}
                  colors={{ datum: 'data.color' }}
                  enableArcLabels={false}
                  enableArcLinkLabels={false}
                  isInteractive={false}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Kullanıcı İstatistikleri */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Kullanıcı İstatistikleri</CardTitle>
              <CardDescription>Sistem kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Toplam</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{userStats.total}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Operatörler</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">{userStats.operators}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Yöneticiler</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{userStats.admins}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Bugün Yeni</span>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-bold">{userStats.newToday}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLA Performansı */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">SLA Performansı</CardTitle>
              <CardDescription>Önceliğe göre SLA karşılama oranı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveBar
                  data={slaPerformance}
                  keys={['met', 'failed']}
                  indexBy="category"
                  margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={['hsl(var(--primary))', 'hsl(var(--destructive))']}
                  borderRadius={4}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Öncelik',
                    legendPosition: 'middle',
                    legendOffset: 40
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Yüzde (%)',
                    legendPosition: 'middle',
                    legendOffset: -50
                  }}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 50,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      symbolSize: 20,
                      symbolShape: 'square'
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Bilet Trendi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Bilet Trendi</CardTitle>
              <CardDescription>Son 7 gün</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveLine
                  data={ticketTrend}
                  margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false,
                    reverse: false
                  }}
                  curve="cardinal"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Gün',
                    legendOffset: 40,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Bilet Sayısı',
                    legendOffset: -50,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  colors={['hsl(var(--primary))']}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Sistem Durumu Özeti */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Sistem Durumu</CardTitle>
              <CardDescription>Temel sistem metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sistem Yükü</p>
                    <p className="font-medium">Normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Percent className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Çevrimiçi</p>
                    <p className="font-medium">99.9%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yanıt Süresi</p>
                    <p className="font-medium">250ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif Kullanıcılar</p>
                    <p className="font-medium">72</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  CalendarRange, 
  LineChart, 
  BarChart3, 
  Download, 
  Filter, 
  Users, 
  CircleAlert, 
  Timer, 
  CheckCheck
} from 'lucide-react'

export default function SlaMonitoringPage() {
  const { t } = useTranslation()
  
  // Demo SLA özeti verileri
  const slaSummary = {
    firstResponse: {
      totalCount: 156,
      metCount: 130,
      metPercent: 83,
      missedCount: 26,
      missedPercent: 17,
      averageTime: '1s 15d', // 1 saat 15 dakika
    },
    resolution: {
      totalCount: 142,
      metCount: 122,
      metPercent: 86,
      missedCount: 20,
      missedPercent: 14,
      averageTime: '8s 42d', // 8 saat 42 dakika
    },
    teamPerformance: [
      { name: 'Murat Operatör', firstResponseMet: 92, resolutionMet: 88 },
      { name: 'Elif Tekniker', firstResponseMet: 85, resolutionMet: 90 },
      { name: 'Ahmet Destek', firstResponseMet: 78, resolutionMet: 82 },
      { name: 'Zeynep Yardım', firstResponseMet: 88, resolutionMet: 84 },
    ]
  }
  
  // Demo risk altındaki biletler
  const atRiskTickets = [
    {
      id: '195',
      subject: 'Web sitesinde ödeme yapamıyorum',
      customer: 'Ali Vural',
      priority: 'high',
      status: 'open',
      responseDeadline: '2025-04-12T15:30:00', // Bugün
      resolutionDeadline: '2025-04-13T12:00:00', // Yarın
      timeTillDeadline: '45d', // 45 dakika
      assignedTo: 'Murat Operatör',
    },
    {
      id: '194',
      subject: 'Sipariş iade sürecinde sorun yaşıyorum',
      customer: 'Selin Yıldız',
      priority: 'medium',
      status: 'open',
      responseDeadline: '2025-04-12T16:15:00',
      resolutionDeadline: '2025-04-13T16:15:00',
      timeTillDeadline: '1s 30d', // 1 saat 30 dakika
      assignedTo: 'Elif Tekniker',
    },
    {
      id: '192',
      subject: 'Ödeme işlemi tamamlanmadı',
      customer: 'Zeynep Kaya',
      priority: 'high',
      status: 'open',
      responseDeadline: '2025-04-12T12:30:00', // İhlal edilmiş
      resolutionDeadline: '2025-04-13T12:30:00',
      timeTillDeadline: '-2s 45d', // 2 saat 45 dakika gecikme
      assignedTo: null,
    },
  ]
  
  // Zaman düzenleyici (pozitif/negatif)
  const formatTimeRemaining = (timeString: string) => {
    if (timeString.startsWith('-')) {
      return <span className="text-red-500">{timeString.substring(1)} gecikme</span>
    }
    return <span>{timeString} kaldı</span>
  }
  
  // Öncelik rozetini döndür
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-500/20 text-red-700">Yüksek</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-700">Orta</Badge>
      case 'low':
        return <Badge variant="outline" className="bg-green-500/20 text-green-700">Düşük</Badge>
      default:
        return <Badge variant="outline">Tanımsız</Badge>
    }
  }
  
  // Durum rozetini döndür
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <Badge variant="outline" className="bg-green-500/20 text-green-700">Açık</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-700">Beklemede</Badge>
      case 'closed':
        return <Badge variant="outline" className="bg-slate-500/20 text-slate-700">Kapalı</Badge>
      default:
        return <Badge variant="outline">Tanımsız</Badge>
    }
  }
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return `Bugün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Yarın, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return (
    <OperatorLayout title={t('sla.monitoringTitle', 'SLA İzleme')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('sla.monitoringTitle', 'SLA İzleme')}</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue="today">
              <SelectTrigger className="w-[180px]">
                <CalendarRange className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Zaman Aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="yesterday">Dün</SelectItem>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Son 30 Gün</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4 mr-1" />
              {t('common.filters', 'Filtreler')}
            </Button>
            
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4 mr-1" />
              {t('common.export', 'Dışa Aktar')}
            </Button>
          </div>
        </div>
        
        {/* SLA özet kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                {t('sla.firstResponse', 'İlk Yanıt SLA')}
              </CardTitle>
              <CardDescription>
                Müşteriye ilk yanıt süresi ölçümleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Toplam Bilet
                  </span>
                  <span className="text-2xl font-bold">
                    {slaSummary.firstResponse.totalCount}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">
                    Ortalama Yanıt Süresi
                  </span>
                  <span className="text-2xl font-bold">
                    {slaSummary.firstResponse.averageTime}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>SLA Karşılama</span>
                  <span className="font-medium">{slaSummary.firstResponse.metPercent}%</span>
                </div>
                <Progress value={slaSummary.firstResponse.metPercent} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-500/10">
                  <CardContent className="p-3 flex flex-col items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                    <span className="text-lg font-bold">{slaSummary.firstResponse.metCount}</span>
                    <span className="text-xs text-muted-foreground">Karşılanan</span>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-500/10">
                  <CardContent className="p-3 flex flex-col items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                    <span className="text-lg font-bold">{slaSummary.firstResponse.missedCount}</span>
                    <span className="text-xs text-muted-foreground">Geciken</span>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCheck className="h-5 w-5 mr-2 text-green-500" />
                {t('sla.resolution', 'Çözüm SLA')}
              </CardTitle>
              <CardDescription>
                Bilet çözüm süresi ölçümleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Toplam Bilet
                  </span>
                  <span className="text-2xl font-bold">
                    {slaSummary.resolution.totalCount}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">
                    Ortalama Çözüm Süresi
                  </span>
                  <span className="text-2xl font-bold">
                    {slaSummary.resolution.averageTime}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>SLA Karşılama</span>
                  <span className="font-medium">{slaSummary.resolution.metPercent}%</span>
                </div>
                <Progress value={slaSummary.resolution.metPercent} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-500/10">
                  <CardContent className="p-3 flex flex-col items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                    <span className="text-lg font-bold">{slaSummary.resolution.metCount}</span>
                    <span className="text-xs text-muted-foreground">Karşılanan</span>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-500/10">
                  <CardContent className="p-3 flex flex-col items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                    <span className="text-lg font-bold">{slaSummary.resolution.missedCount}</span>
                    <span className="text-xs text-muted-foreground">Geciken</span>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="atrisk" className="space-y-4">
          <TabsList>
            <TabsTrigger value="atrisk">
              <CircleAlert className="h-4 w-4 mr-2 text-amber-500" />
              Risk Altındaki Biletler
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Ekip Performansı
            </TabsTrigger>
            <TabsTrigger value="trends">
              <LineChart className="h-4 w-4 mr-2" />
              Trendler
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="atrisk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Altındaki Biletler</CardTitle>
                <CardDescription>SLA ihlali riski taşıyan veya gecikmiş biletler</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bilet</TableHead>
                      <TableHead>Öncelik</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Yanıt Süresi</TableHead>
                      <TableHead>Çözüm Süresi</TableHead>
                      <TableHead>Kalan Süre</TableHead>
                      <TableHead>Atanan</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">#{ticket.id}</span>
                            <a 
                              href={`/operator/inbox/${ticket.id}`} 
                              className="text-sm text-primary hover:underline"
                            >
                              {ticket.subject}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{ticket.customer}</TableCell>
                        <TableCell>{formatDate(ticket.responseDeadline)}</TableCell>
                        <TableCell>{formatDate(ticket.resolutionDeadline)}</TableCell>
                        <TableCell>{formatTimeRemaining(ticket.timeTillDeadline)}</TableCell>
                        <TableCell>
                          {ticket.assignedTo || <span className="text-muted-foreground text-sm">Atanmamış</span>}
                        </TableCell>
                        <TableCell>
                          <Button size="sm">Yanıtla</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ekip Performansı</CardTitle>
                <CardDescription>Operatörlerin SLA karşılama oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operatör</TableHead>
                      <TableHead>İlk Yanıt SLA</TableHead>
                      <TableHead>Çözüm SLA</TableHead>
                      <TableHead>Ortalama Performans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaSummary.teamPerformance.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={member.firstResponseMet} className="h-2 w-[100px]" />
                            <span>{member.firstResponseMet}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={member.resolutionMet} className="h-2 w-[100px]" />
                            <span>{member.resolutionMet}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(member.firstResponseMet + member.resolutionMet) / 2} 
                              className="h-2 w-[100px]" 
                            />
                            <span>{Math.round((member.firstResponseMet + member.resolutionMet) / 2)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="h-5 w-5 mr-2 text-blue-500" />
                    İlk Yanıt Süresi Trendi
                  </CardTitle>
                  <CardDescription>Son 30 günlük ortalama ilk yanıt süresi</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                  <div className="text-muted-foreground flex flex-col items-center">
                    <BarChart3 className="h-16 w-16 mb-2" />
                    <p>Grafik verisi burada gösterilecek</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCheck className="h-5 w-5 mr-2 text-green-500" />
                    Çözüm Süresi Trendi
                  </CardTitle>
                  <CardDescription>Son 30 günlük ortalama çözüm süresi</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                  <div className="text-muted-foreground flex flex-col items-center">
                    <LineChart className="h-16 w-16 mb-2" />
                    <p>Grafik verisi burada gösterilecek</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  )
}

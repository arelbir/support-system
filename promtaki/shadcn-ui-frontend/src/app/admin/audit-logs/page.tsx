'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Filter, 
  History, 
  RefreshCw, 
  Search, 
  SlashSquare,
  Server as ServerIcon,
  ShieldAlert,
  Settings
} from 'lucide-react'

// Modüler bileşenleri içe aktaralım
import { AuditLogTable, AuditLog } from '@/components/admin/audit/AuditLogTable'
import { AuditLogDetails } from '@/components/admin/audit/AuditLogDetails'

export default function AuditLogsPage() {
  // Demo denetim kayıtları - gerçek uygulamada API'dan alınır
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'log-001',
      timestamp: '13.04.2025, 11:32:45',
      userId: 'user-001',
      userName: 'Ahmet Yılmaz',
      action: 'Giriş yapıldı',
      resource: 'Oturum',
      ipAddress: '185.93.245.12',
      severity: 'info'
    },
    {
      id: 'log-002',
      timestamp: '13.04.2025, 10:15:22',
      userId: 'user-002',
      userName: 'Ayşe Demir',
      action: 'Bilet oluşturuldu',
      resource: 'Bilet',
      resourceId: '1254',
      ipAddress: '192.168.1.105',
      severity: 'info'
    },
    {
      id: 'log-003',
      timestamp: '13.04.2025, 09:48:10',
      userId: 'user-003',
      userName: 'Mehmet Kaya',
      action: 'Kullanıcı güncellemesi',
      resource: 'Kullanıcı',
      resourceId: '85',
      details: '{"prevRole": "operator", "newRole": "admin", "reason": "Üst yönetici talebi"}',
      ipAddress: '78.45.123.98',
      severity: 'warning'
    },
    {
      id: 'log-004',
      timestamp: '12.04.2025, 18:22:37',
      userId: 'user-004',
      userName: 'Zeynep Çelik',
      action: 'SLA kuralı değiştirildi',
      resource: 'SLA',
      resourceId: '12',
      details: '{"prevResponseTime": 4, "newResponseTime": 2, "priority": "high"}',
      ipAddress: '195.142.87.36',
      severity: 'warning'
    },
    {
      id: 'log-005',
      timestamp: '12.04.2025, 16:10:55',
      userId: 'user-001',
      userName: 'Ahmet Yılmaz',
      action: 'Başarısız giriş denemesi',
      resource: 'Güvenlik',
      details: 'Kullanıcı şifresi 3 kez yanlış girildi. Hesap geçici olarak kilitlendi.',
      ipAddress: '88.243.156.42',
      severity: 'error'
    },
    {
      id: 'log-006',
      timestamp: '12.04.2025, 14:35:18',
      userId: 'user-005',
      userName: 'Mustafa Şahin',
      action: 'Sistem ayarları değiştirildi',
      resource: 'Ayarlar',
      details: '{"setting": "email_notifications", "prevValue": false, "newValue": true}',
      ipAddress: '176.54.32.98',
      severity: 'info'
    },
    {
      id: 'log-007',
      timestamp: '12.04.2025, 11:05:42',
      userId: 'user-006',
      userName: 'Elif Yıldız',
      action: 'Durum silindi',
      resource: 'Bilet Durumu',
      resourceId: '8',
      details: '{"name": "İncelemeye Alındı", "category": "open"}',
      ipAddress: '212.154.67.23',
      severity: 'warning'
    },
    {
      id: 'log-008',
      timestamp: '11.04.2025, 17:42:19',
      userId: 'system',
      userName: 'Sistem',
      action: 'Otomatik yedekleme',
      resource: 'Veritabanı',
      details: 'Günlük veritabanı yedeklemesi başarıyla tamamlandı. Dosya: backup_20250411.zip',
      ipAddress: '127.0.0.1',
      severity: 'info'
    },
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [currentTab, setCurrentTab] = useState('all')
  
  // Denetim kaydı detayları için state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)
  
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowLogDetails(true)
  }
  
  // Filtreleme işlemleri
  const filteredLogs = logs.filter(log => {
    // Önce tab filtrelemesi uygula
    if (currentTab === 'security' && !(log.resource === 'Güvenlik' || log.action.includes('giriş'))) {
      return false
    }
    if (currentTab === 'system' && log.userName !== 'Sistem') {
      return false
    }
    if (currentTab === 'admin' && !(log.action.includes('ayarları') || log.action.includes('Durum') || log.action.includes('SLA'))) {
      return false
    }
    
    // Sonra severity filtrelemesi
    if (severityFilter !== 'all' && log.severity !== severityFilter) {
      return false
    }
    
    // Arama sorgusu filtrelemesi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        log.userName.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        (log.details && log.details.toLowerCase().includes(query))
      )
    }
    
    return true
  })
  
  return (
    <AdminLayout title="Denetim Kayıtları">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Denetim Kayıtları</h1>
            <p className="text-muted-foreground">
              Sistem genelinde gerçekleştirilen önemli işlemlerin ve değişikliklerin kaydı.
            </p>
          </div>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Dışa Aktar</span>
          </Button>
        </div>
        
        <Separator />
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kullanıcı, işlem veya kaynak ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={severityFilter}
              onValueChange={setSeverityFilter}
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Önem" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Önem Seviyeleri</SelectItem>
                <SelectItem value="info">Bilgi</SelectItem>
                <SelectItem value="warning">Uyarı</SelectItem>
                <SelectItem value="error">Hata</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery('')
              setSeverityFilter('all')
              setActionFilter('all')
            }}>
              <SlashSquare className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4" onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <History className="h-4 w-4" />
              <span>Tümü</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Güvenlik</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <ServerIcon className="h-4 w-4" />
              <span>Sistem</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Yönetim</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <AuditLogTable 
              logs={filteredLogs}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <AuditLogTable 
              logs={filteredLogs}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <AuditLogTable 
              logs={filteredLogs}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4">
            <AuditLogTable 
              logs={filteredLogs}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {filteredLogs.length} kayıt görüntüleniyor
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Önceki
            </Button>
            <Button variant="outline" size="sm" disabled>
              Sonraki
            </Button>
          </div>
        </div>
      </div>
      
      {/* Denetim Kaydı Detayları Dialog */}
      <AuditLogDetails
        open={showLogDetails}
        onOpenChange={setShowLogDetails}
        log={selectedLog}
      />
    </AdminLayout>
  )
}

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Tag,
  MessageSquare,
  Ticket,
  Tag as TagIcon,
  Clock,
  FileText,
  User,
  Users,
  UserRoundCog,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Müşteri tipi tanımı
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
  status: 'active' | 'inactive' | 'pending';
  segment?: 'standard' | 'premium' | 'vip';
  createdAt: string;
  lastActivity?: string;
  ticketsCount: {
    total: number;
    open: number;
  };
  tags: string[];
}

export default function CustomersPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  
  // Demo müşteri verileri
  const customers: Customer[] = [
    {
      id: '1001',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      phone: '+90 532 123 4567',
      company: 'ABC Teknoloji Ltd.',
      status: 'active',
      segment: 'premium',
      createdAt: '2024-09-15T10:30:00',
      lastActivity: '2025-04-11T15:45:00',
      ticketsCount: {
        total: 8,
        open: 2,
      },
      tags: ['teknoloji', 'b2b'],
    },
    {
      id: '1002',
      name: 'Zeynep Kaya',
      email: 'zeynep.kaya@example.com',
      phone: '+90 541 987 6543',
      status: 'active',
      segment: 'vip',
      createdAt: '2024-10-05T14:20:00',
      lastActivity: '2025-04-12T09:30:00',
      ticketsCount: {
        total: 15,
        open: 1,
      },
      tags: ['premium', 'sık alışveriş'],
    },
    {
      id: '1003',
      name: 'Mehmet Demir',
      email: 'mehmet.demir@example.com',
      phone: '+90 553 456 7890',
      company: 'Demir İnşaat',
      status: 'inactive',
      segment: 'standard',
      createdAt: '2024-11-18T09:15:00',
      lastActivity: '2025-03-20T16:10:00',
      ticketsCount: {
        total: 3,
        open: 0,
      },
      tags: ['inşaat', 'b2b'],
    },
    {
      id: '1004',
      name: 'Ayşe Arslan',
      email: 'ayse.arslan@example.com',
      status: 'active',
      segment: 'standard',
      createdAt: '2025-01-10T11:45:00',
      lastActivity: '2025-04-10T14:30:00',
      ticketsCount: {
        total: 6,
        open: 3,
      },
      tags: ['yeni müşteri'],
    },
    {
      id: '1005',
      name: 'Can Yılmaz',
      email: 'can.yilmaz@example.com',
      phone: '+90 537 876 5432',
      status: 'pending',
      createdAt: '2025-03-25T13:20:00',
      ticketsCount: {
        total: 1,
        open: 1,
      },
      tags: [],
    },
  ]
  
  // Müşteri seçimi işlemleri
  const toggleCustomerSelection = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId))
    } else {
      setSelectedCustomers([...selectedCustomers, customerId])
    }
  }
  
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(customer => customer.id))
    }
  }
  
  // Filtrelere göre müşterileri sorgula
  const filteredCustomers = customers.filter(customer => {
    // Arama sorgusuna göre filtrele
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.id.includes(searchQuery)
    
    // Duruma göre filtrele
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    
    // Segmente göre filtrele
    const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter
    
    return matchesSearch && matchesStatus && matchesSegment
  })
  
  // Durum rozetini döndür
  const getStatusBadge = (status: 'active' | 'inactive' | 'pending') => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/20 text-green-700">Aktif</Badge>
      case 'inactive':
        return <Badge variant="outline" className="bg-slate-500/20 text-slate-700">Pasif</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-700">Beklemede</Badge>
    }
  }
  
  // Segment rozetini döndür
  const getSegmentBadge = (segment?: 'standard' | 'premium' | 'vip') => {
    switch(segment) {
      case 'vip':
        return <Badge variant="outline" className="bg-purple-500/20 text-purple-700">VIP</Badge>
      case 'premium':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-700">Premium</Badge>
      case 'standard':
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-700">Standart</Badge>
      default:
        return null
    }
  }
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bilinmiyor'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }
  
  // Müşteri etiketleme işlemi
  const handleTagCustomers = () => {
    // API'ye etiketleme isteğini gönderme işlemi burada yapılacak
    console.log('Tagging customers:', selectedCustomers)
  }
  
  return (
    <OperatorLayout title={t('customers.title', 'Müşteriler')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('customers.title', 'Müşteriler')}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('customers.search', 'Müşteri ara...')}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4 mr-1" />
              {t('common.filters', 'Filtreler')}
            </Button>
            
            <Button className="gap-1">
              <UserPlus className="h-4 w-4 mr-1" />
              {t('customers.addNew', 'Yeni Müşteri')}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              <Users className="h-4 w-4 mr-2" />
              Tüm Müşteriler
            </TabsTrigger>
            <TabsTrigger value="active">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Aktif
            </TabsTrigger>
            <TabsTrigger value="vip">
              <User className="h-4 w-4 mr-2 text-purple-500" />
              VIP
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Son Aktif Olanlar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <UserRoundCog className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standart</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <TagIcon className="h-4 w-4 mr-1" />
                    İşlemler
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleTagCustomers}
                    disabled={selectedCustomers.length === 0}
                    className="gap-2"
                  >
                    <TagIcon className="h-4 w-4" />
                    Etiket Ekle
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    disabled={selectedCustomers.length === 0}
                    className="gap-2"
                  >
                    <UserRoundCog className="h-4 w-4" />
                    Segment Değiştir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" />
                    Dışa Aktar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Müşteri Listesi</CardTitle>
                <CardDescription>Tüm müşteriler ({filteredCustomers.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedCustomers.length > 0 && selectedCustomers.length === customers.length} 
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>İletişim</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>Son Aktivite</TableHead>
                      <TableHead>Biletler</TableHead>
                      <TableHead>Etiketler</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedCustomers.includes(customer.id)} 
                              onCheckedChange={() => toggleCustomerSelection(customer.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {customer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <a href={`/operator/customers/${customer.id}`} className="font-medium hover:underline">
                                  {customer.name}
                                </a>
                                {customer.company && (
                                  <span className="text-xs text-muted-foreground">{customer.company}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <a href={`mailto:${customer.email}`} className="hover:underline">
                                  {customer.email}
                                </a>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDate(customer.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatDate(customer.lastActivity)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {customer.ticketsCount.total}
                              </Badge>
                              {customer.ticketsCount.open > 0 && (
                                <Badge variant="outline" className="bg-green-500/20 text-green-700">
                                  {customer.ticketsCount.open} açık
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {customer.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menü</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <User className="h-4 w-4 mr-2" />
                                  Profili Görüntüle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Ticket className="h-4 w-4 mr-2" />
                                  Biletleri Görüntüle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Mesaj Gönder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Tag className="h-4 w-4 mr-2" />
                                  Etiket Ekle
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                          Filtrelerinizle eşleşen müşteri bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktif Müşteriler</CardTitle>
                <CardDescription>Son 30 gün içinde aktif olan müşteriler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
                  <h3 className="text-lg font-medium">Aktif müşteri listesi</h3>
                  <p className="text-sm">Son 30 gün içinde en az bir bilet oluşturan müşteriler burada görüntülenecek.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vip" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VIP Müşteriler</CardTitle>
                <CardDescription>Özel müşteriler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 text-purple-500/50" />
                  <h3 className="text-lg font-medium">VIP müşteri listesi</h3>
                  <p className="text-sm">VIP segmentindeki müşteriler burada görüntülenecek.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Son Aktif Olan Müşteriler</CardTitle>
                <CardDescription>Son 7 gün içinde aktivite gösteren müşteriler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <h3 className="text-lg font-medium">Son aktiviteler</h3>
                  <p className="text-sm">Son 7 gün içinde aktivite gösteren müşteriler burada görüntülenecek.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Müşteri İstatistikleri
            </CardTitle>
            <CardDescription>Müşteri segmentasyonu ve aktivite istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Toplam Müşteri</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-3xl font-bold">{customers.length}</div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Aktif Müşteriler</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-3xl font-bold">{customers.filter(c => c.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(customers.filter(c => c.status === 'active').length / customers.length * 100)}% aktif oran
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm text-muted-foreground">VIP Müşteriler</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-3xl font-bold">{customers.filter(c => c.segment === 'vip').length}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(customers.filter(c => c.segment === 'vip').length / customers.length * 100)}% VIP oran
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  )
}

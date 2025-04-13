'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  User2, 
  MoreHorizontal, 
  Tag, 
  Inbox,
  CheckCircle2,
  PauseCircle,
  UserPlus
} from 'lucide-react'
import ticketService, { Ticket as ApiTicket, Status, User } from '@/services/ticketServiceV2'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Bilet tipi tanımı
interface TicketUI {
  id: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  statusCategory: 'open' | 'pending' | 'closed';
  category: string;
  assignedTo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  sla: {
    responseTime: string;
    responseStatus: 'ontrack' | 'atrisk' | 'overdue';
    resolutionTime: string;
    resolutionStatus: 'ontrack' | 'atrisk' | 'overdue';
  };
}

export default function TicketQueuePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  
  // Bilet kuyruğunu React Query ile çekme
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', searchQuery, assigneeFilter, priorityFilter, statusFilter, page, limit],
    queryFn: () => ticketService.getTicketQueue({
      searchQuery,
      assignedOperatorId: assigneeFilter === 'assigned' ? undefined : 
                         assigneeFilter === 'unassigned' ? 0 : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter as any : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
    }),
    enabled: isAuthenticated, // Sadece kullanıcı giriş yapmışsa çalışır
  })

  // API'den dönen verileri UI formatına dönüştürme
  const convertApiToUiTicket = (apiTicket: ApiTicket): TicketUI => {
    // Status bilgilerini çıkar
    const statusInfo = apiTicket.status || { 
      name: 'Bilinmiyor', 
      category: 'open' as const 
    };
    
    // Kullanıcı bilgilerini çıkar
    const userInfo = apiTicket.user || { 
      name: 'İsimsiz Kullanıcı', 
      email: 'unknown@example.com' 
    };
    
    // Operatör bilgilerini çıkar
    const operatorInfo = apiTicket.assignedOperator;
    
    // SLA durumunu belirlemek için bir fonksiyon (basit örnek)
    const determineSlaStatus = (dueDate?: string): 'ontrack' | 'atrisk' | 'overdue' => {
      if (!dueDate) return 'ontrack';
      
      const now = new Date();
      const due = new Date(dueDate);
      
      // Süre dolmuşsa
      if (now > due) return 'overdue';
      
      // Son 24 saat içindeyse riskli
      const timeDiff = due.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24 ? 'atrisk' : 'ontrack';
    };

    // Kalan süreyi formatla
    const formatTimeRemaining = (dueDate?: string): string => {
      if (!dueDate) return 'Belirlenmedi';
      
      const now = new Date();
      const due = new Date(dueDate);
      
      // Süre dolmuşsa
      if (now > due) {
        const timeDiff = now.getTime() - due.getTime();
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(hoursDiff / 24);
        
        if (daysDiff > 0) return `${daysDiff}g geçti`;
        return `${hoursDiff}s geçti`;
      }
      
      // Kalan süre
      const timeDiff = due.getTime() - now.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysDiff = Math.floor(hoursDiff / 24);
      
      if (daysDiff > 0) return `${daysDiff}g ${hoursDiff % 24}s`;
      return `${hoursDiff}s`;
    };
    
    return {
      id: apiTicket.id.toString(),
      subject: apiTicket.subject,
      customer: {
        name: userInfo.name,
        email: userInfo.email
      },
      priority: apiTicket.priority,
      status: statusInfo.name,
      statusCategory: statusInfo.category as 'open' | 'pending' | 'closed',
      category: apiTicket.category || 'Genel',
      assignedTo: operatorInfo ? {
        name: operatorInfo.name,
        email: operatorInfo.email
      } : undefined,
      tags: apiTicket.tags?.map(tag => tag.name) || [],
      createdAt: apiTicket.createdAt,
      updatedAt: apiTicket.updatedAt,
      sla: {
        responseTime: formatTimeRemaining(apiTicket.firstResponseDueDate),
        responseStatus: determineSlaStatus(apiTicket.firstResponseDueDate),
        resolutionTime: formatTimeRemaining(apiTicket.dueDate),
        resolutionStatus: determineSlaStatus(apiTicket.dueDate),
      }
    };
  };

  // Demo verileri yerine gerçek veriler
  const tickets: TicketUI[] = data?.data ? 
    data.data.map(convertApiToUiTicket) : [];

  // Bilet seçimi işlemleri
  const toggleTicketSelection = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId))
    } else {
      setSelectedTickets([...selectedTickets, ticketId])
    }
  }
  
  const toggleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(tickets.map(ticket => ticket.id))
    }
  }
  
  // Filtreler ile biletleri sorgula
  const filteredTickets = tickets.filter(ticket => {
    // Arama sorgusuna göre filtrele
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.includes(searchQuery)
    
    // Atanan kişiye göre filtrele
    const matchesAssignee = assigneeFilter === 'all' ||
                           (assigneeFilter === 'unassigned' && !ticket.assignedTo) ||
                           (assigneeFilter === 'assigned' && ticket.assignedTo)
    
    // Önceliğe göre filtrele
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    // Duruma göre filtrele
    const matchesStatus = statusFilter === 'all' || ticket.statusCategory === statusFilter
    
    return matchesSearch && matchesAssignee && matchesPriority && matchesStatus
  })
  
  // SLA durumuna göre renk sınıfı döndür
  const getSlaStatusClass = (status: 'ontrack' | 'atrisk' | 'overdue') => {
    switch (status) {
      case 'ontrack': return 'text-green-600'
      case 'atrisk': return 'text-amber-600'
      case 'overdue': return 'text-red-600'
    }
  }
  
  // Önceliğe göre badge sınıfı döndür
  const getPriorityBadgeClass = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-700'
      case 'medium': return 'bg-blue-500/20 text-blue-700'
      case 'high': return 'bg-red-500/20 text-red-700'
      case 'urgent': return 'bg-orange-500/20 text-orange-700'
    }
  }
  
  // Duruma göre badge sınıfı döndür
  const getStatusBadgeClass = (statusCategory: 'open' | 'pending' | 'closed') => {
    switch (statusCategory) {
      case 'open': return 'bg-green-500/20 text-green-700'
      case 'pending': return 'bg-amber-500/20 text-amber-700'
      case 'closed': return 'bg-slate-500/20 text-slate-700'
    }
  }
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString: string) => {
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
  
  // Bilet atama işlemi
  const handleAssignTickets = () => {
    // API'ye atama isteğini gönderme işlemi burada yapılacak
    console.log('Assigning tickets:', selectedTickets)
  }
  
  // Hata durumunda kullanıcıya bildirim göster
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Biletler yüklenemedi",
        description: "Bilet verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);

  // Manuel yenileme işlevi
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Yenileniyor",
      description: "Bilet verileri yenileniyor...",
    });
  };

  return (
    <OperatorLayout title={t('tickets.queueTitle', 'Bilet Kuyruğu')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('tickets.queueTitle', 'Bilet Kuyruğu')}</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('tickets.search', 'Bilet ara...')}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4 mr-1" />
              {t('common.filters', 'Filtreler')}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1">
                  <Inbox className="h-4 w-4 mr-1" />
                  {t('tickets.actions', 'İşlemler')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleAssignTickets}
                  disabled={selectedTickets.length === 0}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {t('tickets.assignTo', 'Şuna Ata...')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={selectedTickets.length === 0}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('tickets.markAsSolved', 'Çözüldü Olarak İşaretle')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={selectedTickets.length === 0}
                  className="gap-2"
                >
                  <PauseCircle className="h-4 w-4" />
                  {t('tickets.markAsPending', 'Beklemede Olarak İşaretle')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <Tag className="h-4 w-4" />
                  {t('tickets.addTags', 'Etiket Ekle')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tümü ({tickets.length})</TabsTrigger>
            <TabsTrigger value="unassigned">Atanmamış ({tickets.filter(t => !t.assignedTo).length})</TabsTrigger>
            <TabsTrigger value="urgent">Acil ({tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length})</TabsTrigger>
            <TabsTrigger value="sla">SLA Kritik ({tickets.filter(t => t.sla.responseStatus === 'overdue' || t.sla.responseStatus === 'atrisk').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[180px]">
                  <User2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Atanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="assigned">Atananlar</SelectItem>
                  <SelectItem value="unassigned">Atanmayanlar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="open">Açık</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="closed">Kapalı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>{t('tickets.queueTitle', 'Bilet Kuyruğu')}</CardTitle>
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`lucide lucide-refresh-cw ${isLoading ? 'animate-spin' : ''}`}
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                  </Button>
                </div>
                <CardDescription className="flex items-center">
                  Tüm biletleri görüntüleyin, atayın ve yönetin.
                  {isLoading && <span className="ml-2 inline-block text-blue-600">Yükleniyor...</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedTickets.length > 0 && selectedTickets.length === tickets.length} 
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Bilet</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Öncelik</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Atanan</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedTickets.includes(ticket.id)} 
                              onCheckedChange={() => toggleTicketSelection(ticket.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">#{ticket.id}</span>
                              <a href={`/operator/inbox/${ticket.id}`} className="text-sm text-primary hover:underline">
                                {ticket.subject}
                              </a>
                              <div className="flex gap-1 mt-1">
                                {ticket.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{ticket.customer.name}</span>
                                <span className="text-xs text-muted-foreground">{ticket.customer.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityBadgeClass(ticket.priority)}>
                              {ticket.priority === 'high' ? 'Yüksek' : ticket.priority === 'medium' ? 'Orta' : ticket.priority === 'low' ? 'Düşük' : 'Acil'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(ticket.statusCategory)}>
                              {ticket.statusCategory === 'open' ? 'Açık' : ticket.statusCategory === 'pending' ? 'Beklemede' : 'Kapalı'}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.category}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={`text-xs flex items-center gap-1 ${getSlaStatusClass(ticket.sla.responseStatus)}`}>
                                <Clock className="h-3 w-3" />
                                {ticket.sla.responseTime}
                              </span>
                              <span className={`text-xs flex items-center gap-1 mt-1 ${getSlaStatusClass(ticket.sla.resolutionStatus)}`}>
                                <CheckCircle2 className="h-3 w-3" />
                                {ticket.sla.resolutionTime}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {ticket.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>
                                    {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{ticket.assignedTo.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Atanmadı</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{formatDate(ticket.createdAt)}</span>
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
                                <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                                <DropdownMenuItem>Yanıtla</DropdownMenuItem>
                                <DropdownMenuItem>Ata</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Etiket Ekle</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                          Filtrelerinizle eşleşen bilet bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unassigned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atanmamış Biletler</CardTitle>
                <CardDescription>Henüz hiçbir operatöre atanmamış biletler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Üzerinde çalışılacak biletler burada görüntülenecek.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Acil Biletler</CardTitle>
                <CardDescription>Yüksek öncelikli biletler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Acil ve yüksek öncelikli biletler burada görüntülenecek.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sla" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SLA Kritik Biletler</CardTitle>
                <CardDescription>Yanıt süresi aşılan veya riskli biletler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  SLA durumu kritik olan biletler burada görüntülenecek.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  )
}

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Clock, Tag, MessageSquare } from 'lucide-react'

// Yardımcı fonksiyon: SLA zamanı gösterimi
function formatSlaTime(minutes: number, t: any) {
  if (minutes < 60) {
    return `${minutes}${t('sla.minute')}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}${t('sla.hour')} ${remainingMinutes > 0 ? `${remainingMinutes}${t('sla.minute')}` : ''}`;
}

// Yardımcı fonksiyon: SLA durumu rengini belirle
function getSlaStatusClass(minutes: number) {
  if (minutes < 30) {
    return 'text-red-500';
  }
  if (minutes < 120) {
    return 'text-amber-500';
  }
  return 'text-green-500';
}

export default function OperatorInbox() {
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('assigned')
  const { t } = useTranslation()
  
  // Mock bilet verileri
  const tickets = [
    {
      id: 1001,
      subject: 'Ödeme sistemi hatası',
      customer: 'Ahmet Yılmaz',
      status: 'open',
      priority: 'high',
      category: 'Ödeme',
      assignedTo: 'Operator',
      createdAt: '2025-04-10T14:30:00',
      slaMinutesLeft: 25,
      tags: ['ödeme', 'hata', 'acil'],
      unreadMessages: 2
    },
    {
      id: 1002,
      subject: 'Hesap erişim sorunu',
      customer: 'Ayşe Kaya',
      status: 'pending',
      priority: 'medium',
      category: 'Hesap',
      assignedTo: 'Operator',
      createdAt: '2025-04-11T09:15:00',
      slaMinutesLeft: 130,
      tags: ['hesap', 'erişim'],
      unreadMessages: 0
    },
    {
      id: 1003,
      subject: 'Ürün bilgisi talebi',
      customer: 'Mehmet Demir',
      status: 'open',
      priority: 'low',
      category: 'Bilgi',
      assignedTo: 'Operator',
      createdAt: '2025-04-11T11:40:00',
      slaMinutesLeft: 220,
      tags: ['bilgi', 'ürün'],
      unreadMessages: 1
    },
    {
      id: 1004,
      subject: 'API entegrasyon hatası',
      customer: 'Kemal Özcan',
      status: 'open',
      priority: 'high',
      category: 'Teknik',
      assignedTo: null,
      createdAt: '2025-04-12T08:20:00',
      slaMinutesLeft: 40,
      tags: ['api', 'teknik', 'entegrasyon'],
      unreadMessages: 0
    },
    {
      id: 1005,
      subject: 'Sipariş iptal talebi',
      customer: 'Zeynep Kara',
      status: 'open',
      priority: 'medium',
      category: 'Sipariş',
      assignedTo: null,
      createdAt: '2025-04-12T10:05:00',
      slaMinutesLeft: 150,
      tags: ['sipariş', 'iptal'],
      unreadMessages: 0
    }
  ];
  
  // Sekmeye göre biletleri filtrele
  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'assigned') {
      return ticket.assignedTo === 'Operator';
    }
    if (activeTab === 'unassigned') {
      return ticket.assignedTo === null;
    }
    return true; // all tab
  });
  
  // Arama işlevi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${t('common.search')}: ${searchText}`);
  };
  
  // Durum rengi belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-700 hover:bg-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30';
      case 'closed': return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };
  
  // Öncelik rengi belirle
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 hover:bg-red-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 hover:bg-green-500/30';
      default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };
  
  return (
    <OperatorLayout
      title={t('nav.inbox')}
      user={{
        name: 'Murat Yıldız',
        email: 'operator@example.com',
      }}
      notificationCount={2}
    >
      <div className="col-span-12 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.inbox')}</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {t('common.filter')}
            </Button>
            <Button>
              {t('tickets.search')}
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('tickets.filter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    placeholder={t('tickets.subject') + ', ID ' + t('common.or') + ' ' + t('user.name') + '...'}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Button type="submit" variant="secondary">
                    <Search className="h-4 w-4 mr-2" />
                    {t('common.search')}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="assigned">{t('nav.assigned')}</TabsTrigger>
            <TabsTrigger value="unassigned">{t('tickets.unassigned')}</TabsTrigger>
            <TabsTrigger value="all">{t('nav.all')}</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('tickets.id')}</TableHead>
                      <TableHead className="w-[250px]">{t('tickets.subject')}</TableHead>
                      <TableHead>{t('user.name')}</TableHead>
                      <TableHead>{t('tickets.status')}</TableHead>
                      <TableHead>{t('tickets.priority')}</TableHead>
                      <TableHead>{t('tickets.category')}</TableHead>
                      <TableHead>{t('sla.time')}</TableHead>
                      <TableHead>Etiketler</TableHead>
                      <TableHead>{t('tickets.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ticket.subject}
                            {ticket.unreadMessages > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                <MessageSquare className="h-3 w-3 mr-1" /> {ticket.unreadMessages}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{ticket.customer}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {t(`tickets.statusTypes.${ticket.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {t(`tickets.priorityTypes.${ticket.priority}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className={`h-3 w-3 ${getSlaStatusClass(ticket.slaMinutesLeft)}`} />
                            <span className={getSlaStatusClass(ticket.slaMinutesLeft)}>
                              {formatSlaTime(ticket.slaMinutesLeft, t)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {ticket.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" /> {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t('tickets.view')}</DropdownMenuItem>
                              <DropdownMenuItem>{t('tickets.reply')}</DropdownMenuItem>
                              <DropdownMenuItem>Etiket Ekle</DropdownMenuItem>
                              <DropdownMenuItem>{t('tickets.assign')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          {t('tickets.noTickets')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  )
}

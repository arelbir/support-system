'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { TicketsList, Ticket as TicketUI } from '@/components/shared/TicketsList'
import { CreateTicketModal } from '@/components/shared/CreateTicketModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import ticketService, { Ticket as ApiTicket } from '@/services/ticketServiceV2'

// API Ticket'ı TicketsList bileşeni için doğru formata dönüştür
const convertApiToUITicket = (apiTicket: ApiTicket): TicketUI => {
  console.log('Dönüştürülecek bilet:', apiTicket);
  
  if (!apiTicket) {
    console.error('Dönüştürülecek bilet bulunamadı');
    // Hata durumunda boş bir bilet döndür (varsayılan değerlerle)
    return {
      id: 0,
      subject: 'Bilet yüklenemedi',
      status: 'open',
      priority: 'medium',
      category: 'Genel',
      createdAt: new Date().toISOString(),
      assignedTo: 'Atanmadı',
    };
  }

  // Status category'si 'solved' ise 'closed' olarak değiştir - TicketsList bileşeni ile uyumlu olması için
  let statusCategory = 'open'; // Varsayılan değer
  
  if (apiTicket.Status?.category) {
    statusCategory = apiTicket.Status.category;
    if (statusCategory === 'solved') {
      statusCategory = 'closed';
    }
  }
  
  // Priority değeri kontrolü
  let priority = apiTicket.priority || 'medium';
  if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
    priority = 'medium'; // Geçersiz priority değeri için varsayılan
  }
  
  // Atanan kişi bilgisi - birden fazla kaynaktan gelebilir
  let assignedTo = 'Atanmadı';
  if (apiTicket.assignedOperator?.name) {
    assignedTo = apiTicket.assignedOperator.name;
  } else if (apiTicket.assignedOperator?.username) {
    assignedTo = apiTicket.assignedOperator.username;
  } else if (apiTicket.User?.name) {
    assignedTo = apiTicket.User.name;
  } else if (apiTicket.User?.username) {
    assignedTo = apiTicket.User.username;
  }
  
  return {
    id: apiTicket.id || 0,
    subject: apiTicket.subject || 'Başlık bulunamadı',
    status: statusCategory as 'open' | 'pending' | 'closed',
    priority: priority as 'low' | 'medium' | 'high' | 'urgent',
    category: apiTicket.category || 'Genel',
    createdAt: apiTicket.createdAt || new Date().toISOString(),
    assignedTo: assignedTo,
  };
};

export default function TicketsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  
  // State tanımlamaları
  const [limit, setLimit] = useState(7)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  
  // Backend'den biletleri getir (Infinite Query)
  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useInfiniteQuery({
    queryKey: ['myTickets', limit, searchText, activeTab],
    queryFn: ({ pageParam }) => ticketService.getMyTickets({
      page: pageParam as number,
      limit,
      status: activeTab !== 'all' ? activeTab : undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Eğer daha fazla sayfa varsa bir sonraki sayfa numarasını döndür
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined;
    },
    enabled: isAuthenticated, // Sadece kullanıcı giriş yapmışsa çalıştır
  });

  // Tüm sayfalardaki biletleri düzleştir
  const tickets: TicketUI[] = React.useMemo(() => {
    if (!data) return [];
    
    const allTickets: TicketUI[] = [];
    
    // Tüm sayfalardan biletleri al ve düzleştir
    data.pages.forEach((page: any) => {
      if (Array.isArray(page.data)) {
        page.data.forEach((ticket: ApiTicket) => {
          try {
            const convertedTicket = convertApiToUITicket(ticket);
            allTickets.push(convertedTicket);
          } catch (error) {
            console.error('Bilet dönüştürme hatası:', error, ticket);
          }
        });
      }
    });
    
    return allTickets;
  }, [data]);
  
  console.log('Dönüştürülmüş biletler:', tickets);
  
  // "Daha fazla yükle" butonuna tıklandığında sonraki sayfayı getir
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  // Hata durumunda kullanıcıya bildir
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

  // Bilet görüntüleme
  const handleViewTicket = (ticketId: number) => {
    router.push(`/customer/tickets/${ticketId}`)
  }
  
  // Tab değişikliği
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  // Arama
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`${t('common.search')}: ${searchText}`)
  }
  
  // Bilet oluşturma işlemi
  const handleTicketCreated = () => {
    // Yeni talep başarıyla oluşturulduğunda çağrılacak
    // API'den güncel verileri yükle
    setTimeout(() => {
      refetch();
    }, 500)
  }
  
  return (
    <CustomerLayout
      title={t('nav.myTickets')}
      subtitle={t('tickets.subtitle')}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('tickets.newTicket')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {/* Filtreleme, arama alanı ve tab'lar */}
        <Card className="shadow-none border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Arama Alanı */}
              <div className="w-full md:w-auto flex-1">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input 
                    type="search" 
                    placeholder={t('common.searchPlaceholder')} 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)} 
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    {t('common.search')}
                  </Button>
                </form>
              </div>
              
              {/* Durum Tab'ları */}
              <div className="w-full md:w-auto">
                <Tabs 
                  defaultValue="all" 
                  value={activeTab} 
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="all">{t('tickets.allTickets')}</TabsTrigger>
                    <TabsTrigger value="open">{t('tickets.openTickets')}</TabsTrigger>
                    <TabsTrigger value="pending">{t('tickets.pendingTickets')}</TabsTrigger>
                    <TabsTrigger value="closed">{t('tickets.closedTickets')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Diğer Filtreler */}
              <div className="ml-auto">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('common.filter')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tab içerikleri */}
        <Tabs defaultValue="all" value={activeTab} className="hidden">
          <TabsContent value="all" className="mt-0">
            <Card className="shadow-none border-0">
              <CardHeader>
                <CardTitle>{t('tickets.allTickets')}</CardTitle>
                <CardDescription>{t('tickets.allTicketsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  <TicketsList 
                    tickets={tickets} 
                    isLoading={isLoading}
                    onTicketClick={handleViewTicket}
                    hasMore={hasNextPage}
                    isLoadingMore={isFetchingNextPage}
                    onLoadMore={handleLoadMore}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Aktif tab içeriği */}
        <Card className="shadow-none border-0">
          <CardContent>
            <TicketsList 
              tickets={tickets} 
              isLoading={isLoading}
              onTicketClick={handleViewTicket}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
              onLoadMore={handleLoadMore}
            />
            
            {/* Observer referansını ayrı bir bileşene yerleştirmek yerine, manuel yükleme için düğmeye çevir */}
            {hasNextPage && (
              <div className="py-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? t('common.loading') + '...' : t('common.loadMore')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Yeni bilet oluşturma modalı */}
      <CreateTicketModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onTicketCreated={handleTicketCreated}
      />
    </CustomerLayout>
  );
}

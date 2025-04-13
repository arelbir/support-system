'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Paperclip, 
  Send,
  Smile,
} from 'lucide-react'
import ticketService, { Ticket, Message } from '@/services/ticketServiceV2'

interface TicketDetailProps {
  params: {
    id: string
  }
}

export default function TicketDetail({ params }: TicketDetailProps) {
  // Next.js params'ı doğrudan kullan, Typescript hatası vermeyecek şekilde
  const ticketId = parseInt(params.id)
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [newMessage, setNewMessage] = useState('')

  // Bilet detayını getir
  const { 
    data: ticket, 
    isLoading: isTicketLoading, 
    isError: isTicketError,
    error: ticketError
  } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicketById(ticketId),
    enabled: !isNaN(ticketId)
  })

  // Bilete ait mesajları getir
  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError: isMessagesError
  } = useQuery({
    queryKey: ['messages', ticketId],
    queryFn: () => ticketService.getMessages(ticketId, true),
    enabled: !isNaN(ticketId)
  })

  // Yeni mesaj gönderme mutasyonu
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      ticketService.addMessage({
        ticketId,
        content,
        isInternal: false
      }),
    onSuccess: () => {
      // Başarılı mesaj gönderimi sonrası mesajları yenile
      queryClient.invalidateQueries({queryKey: ['messages', ticketId]})
      toast({
        title: "Mesaj gönderildi",
        description: "Mesajınız başarıyla gönderildi.",
      })
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
      console.error("Mesaj gönderme hatası:", error)
    }
  })

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    sendMessageMutation.mutate(newMessage.trim())
    setNewMessage('')
  }
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  // Hata durumları
  if (isTicketError) {
    return (
      <CustomerLayout title="Bilet Bulunamadı">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Bilet yüklenirken bir hata oluştu</h2>
          <p className="text-muted-foreground mb-6">{ticketError instanceof Error ? ticketError.message : 'Bilinmeyen hata'}</p>
          <Button onClick={() => router.push('/customer/tickets')}>
            Biletlere Dön
          </Button>
        </div>
      </CustomerLayout>
    )
  }

  // Yükleniyor durumu
  if (isTicketLoading) {
    return (
      <CustomerLayout title="Bilet Yükleniyor...">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="text-muted-foreground">Bilet bilgileri yükleniyor...</p>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout title={`#${ticketId} ${ticket?.subject || 'Bilet Detayı'}`}>
      <div className="col-span-12 flex flex-col h-[calc(100vh-64px)] w-full max-w-full">
        {/* Ticket Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/customer/tickets')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium">
              #{ticketId} {ticket?.subject}
            </h1>
            {ticket?.priority && (
              <Badge className={`ml-2 ${
                ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-500' :
                ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
              </Badge>
            )}
            {ticket?.Status && (
              <Badge variant="outline" className="ml-2">
                {ticket.Status.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => router.push('/customer/tickets/new')}>
              Yeni Bilet Oluştur
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
          <TabsList className="border-b rounded-none px-4">
            <TabsTrigger value="conversation">Yazışmalar</TabsTrigger>
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="activity">İşlem Geçmişi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation" className="flex-1 flex flex-col p-0 data-[state=active]:flex-1 w-full">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 w-full">
              {isMessagesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message: Message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex ${message.user?.id === ticket?.userId ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex max-w-[80%]">
                        {message.user?.id !== ticket?.userId && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {(message.user?.name || message.user?.username || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${message.user?.id !== ticket?.userId ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.user?.name || message.user?.username || '?'}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                          </div>
                          <div 
                            className={`p-3 rounded-lg ${
                              message.user?.id === ticket?.userId
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                        {message.user?.id === ticket?.userId && (
                          <Avatar className="h-8 w-8 ml-2">
                            <AvatarFallback>
                              {(message.user?.name || message.user?.username || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Henüz bu bilete ait mesaj bulunmuyor.</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t w-full">
              <div className="flex items-center gap-2 bg-background border rounded-md p-2 w-full">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı buraya yazın..."
                    className="flex-1 border-0 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                  />
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      type="button" 
                      className="h-8 w-8"
                      disabled={sendMessageMutation.isPending}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSendMessage} 
                      size="sm"
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="flex-1 p-4 overflow-y-auto">
            {ticket && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Bilet Bilgileri</h3>
                      <div className="bg-muted/50 p-4 rounded-md space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Durum:</span>
                          <Badge 
                            style={{ backgroundColor: ticket.Status?.color || '#3B82F6' }}
                            className="text-white"
                          >
                            {ticket.Status?.name || 'Belirsiz'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Öncelik:</span>
                          <Badge className={`${
                            ticket.priority === 'high' ? 'bg-orange-500' : 
                            ticket.priority === 'urgent' ? 'bg-red-500' : 
                            ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Kategori:</span>
                          <span>{ticket.category || 'Genel'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tip:</span>
                          <span>{ticket.type || 'Belirsiz'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Oluşturulma Tarihi:</span>
                          <span>{format(new Date(ticket.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Son Güncelleme:</span>
                          <span>{format(new Date(ticket.updatedAt), 'dd.MM.yyyy HH:mm')}</span>
                        </div>
                        {ticket.dueDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Son Tarih:</span>
                            <span>{format(new Date(ticket.dueDate), 'dd.MM.yyyy HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">İlgili Kişiler</h3>
                      <div className="bg-muted/50 p-4 rounded-md space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Oluşturan:</span>
                          <span className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {(ticket.User?.username || '?').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {ticket.User?.username || 'Bilinmiyor'} ({ticket.User?.email})
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Atanan Operatör:</span>
                          <span>
                            {ticket.assignedOperator?.username ? 
                              <span className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {(ticket.assignedOperator.username || '?').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {ticket.assignedOperator.username}
                              </span> 
                              : 'Henüz atanmadı'}
                          </span>
                        </div>
                        {ticket.notifyEmails && ticket.notifyEmails.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bildirim E-postaları:</span>
                            <div className="text-right">
                              {ticket.notifyEmails.map((email: string, idx: number) => (
                                <div key={idx}>{email}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {(ticket.Product || ticket.Module) && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Ürün & Modül</h3>
                        <div className="bg-muted/50 p-4 rounded-md space-y-3">
                          {ticket.Product && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Ürün:</span>
                              <span className="font-medium">{ticket.Product.name}</span>
                            </div>
                          )}
                          {ticket.Module && (
                            <div className="flex flex-col text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Modül:</span>
                                <span className="font-medium">{ticket.Module.name}</span>
                              </div>
                              {ticket.Module.description && (
                                <div className="mt-2 text-xs text-muted-foreground max-h-20 overflow-y-auto">
                                  {ticket.Module.description}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Etiketler</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <div className="flex flex-wrap gap-2">
                            {ticket.tags.map((tag: any) => (
                              <Badge 
                                key={tag.id} 
                                style={{ backgroundColor: tag.color || '#888' }}
                                className="text-white"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ticket.timeMetrics && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">SLA Bilgileri</h3>
                        <div className="bg-muted/50 p-4 rounded-md space-y-3">
                          {ticket.timeMetrics.firstResponseAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">İlk Yanıt:</span>
                              <span>{format(new Date(ticket.timeMetrics.firstResponseAt), 'dd.MM.yyyy HH:mm')}</span>
                            </div>
                          )}
                          {ticket.timeMetrics.slaResponseDue && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Yanıt SLA:</span>
                              <span className={ticket.timeMetrics.slaResponseBreached ? 'text-red-500 font-medium' : ''}>
                                {format(new Date(ticket.timeMetrics.slaResponseDue), 'dd.MM.yyyy HH:mm')}
                                {ticket.timeMetrics.slaResponseBreached && ' (Aşıldı)'}
                              </span>
                            </div>
                          )}
                          {ticket.timeMetrics.slaResolutionDue && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Çözüm SLA:</span>
                              <span className={ticket.timeMetrics.slaResolutionBreached ? 'text-red-500 font-medium' : ''}>
                                {format(new Date(ticket.timeMetrics.slaResolutionDue), 'dd.MM.yyyy HH:mm')}
                                {ticket.timeMetrics.slaResolutionBreached && ' (Aşıldı)'}
                              </span>
                            </div>
                          )}
                          {ticket.timeMetrics.currentlyPaused && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Durum:</span>
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                SLA Duraklatıldı
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Açıklama</h3>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 p-4">
            {ticket && ticket.history && ticket.history.length > 0 ? (
              <div className="space-y-4">
                {ticket.history.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="min-w-8 flex justify-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 pb-4 border-l pl-4 border-muted">
                      <div className="text-sm">{item.action || 'İşlem'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.timestamp ? format(new Date(item.timestamp), 'dd.MM.yyyy HH:mm') : ''}
                      </div>
                      {item.description && (
                        <div className="text-sm mt-2">{item.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                İşlem geçmişi bulunamadı veya henüz eklenmedi.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  )
}

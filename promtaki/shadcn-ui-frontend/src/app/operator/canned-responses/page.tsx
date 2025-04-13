'use client'

import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  MessageSquare, 
  PlusCircle, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Copy, 
  Tag, 
  CheckCircle2,
  Clock,
  Bookmark,
  FileText,
  Users,
  BookOpen,
  ChevronRight,
  Info
} from 'lucide-react'

// Hazır yanıt tipi tanımı
interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isShared: boolean;
}

export default function CannedResponsesPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedResponse, setSelectedResponse] = useState<CannedResponse | null>(null)
  
  // Demo kategoriler
  const categories = [
    { id: 'general', name: 'Genel Yanıtlar', count: 8 },
    { id: 'greeting', name: 'Karşılama', count: 5 },
    { id: 'payment', name: 'Ödeme', count: 6 },
    { id: 'shipping', name: 'Kargo', count: 4 },
    { id: 'return', name: 'İade', count: 7 },
    { id: 'technical', name: 'Teknik Destek', count: 9 },
  ]
  
  // Demo hazır yanıtlar
  const cannedResponses: CannedResponse[] = [
    {
      id: '1',
      title: 'Karşılama Mesajı',
      content: 'Merhaba, [Müşteri Adı]. [Şirket Adı] Destek Ekibi\'nden [Operatör Adı]. Size nasıl yardımcı olabilirim?',
      category: 'greeting',
      tags: ['karşılama', 'açılış'],
      usageCount: 248,
      createdAt: '2025-01-10T09:15:00',
      updatedAt: '2025-01-10T09:15:00',
      createdBy: 'Murat Görevli',
      isShared: true,
    },
    {
      id: '2',
      title: 'Ödeme Onayı',
      content: 'Ödemeniz başarıyla alınmıştır. Sipariş referans numaranız: [Sipariş No]. Siparişiniz en kısa sürede işleme alınacaktır. Herhangi bir sorunuz olursa bize bildirebilirsiniz.',
      category: 'payment',
      tags: ['ödeme', 'onay'],
      usageCount: 186,
      createdAt: '2025-01-15T14:30:00',
      updatedAt: '2025-02-20T11:45:00',
      createdBy: 'Elif Sevgi',
      isShared: true,
    },
    {
      id: '3',
      title: 'Teknik Sorun Çözüm Adımları',
      content: 'Yaşadığınız teknik sorunu çözmek için lütfen şu adımları deneyin:\n\n1. Tarayıcınızın önbelleğini temizleyin\n2. Çerezleri temizleyin\n3. Sayfayı yeniden yükleyin\n4. Farklı bir tarayıcı deneyin\n\nBu adımlar sorunu çözmezse, lütfen bize tekrar ulaşın.',
      category: 'technical',
      tags: ['teknik', 'sorun', 'çözüm'],
      usageCount: 145,
      createdAt: '2025-01-20T10:00:00',
      updatedAt: '2025-03-15T09:30:00',
      createdBy: 'Kemal Teknik',
      isShared: true,
    },
    {
      id: '4',
      title: 'Kargo Takip Bilgisi',
      content: 'Siparişiniz [Tarih] tarihinde [Kargo Firması] firmasına teslim edilmiştir. Takip numaranız: [Takip No]. Bu numara ile kargo firmasının web sitesinden siparişinizi takip edebilirsiniz.',
      category: 'shipping',
      tags: ['kargo', 'takip'],
      usageCount: 210,
      createdAt: '2025-02-05T13:20:00',
      updatedAt: '2025-02-05T13:20:00',
      createdBy: 'Zeynep Yardım',
      isShared: false,
    },
    {
      id: '5',
      title: 'İade Talebi Onayı',
      content: 'İade talebiniz onaylanmıştır. Lütfen ürünü orijinal ambalajında [Adres] adresine gönderiniz. Ürün tarafımıza ulaştıktan sonra kontrol edilecek ve ödemeniz 5-7 iş günü içerisinde iade edilecektir.',
      category: 'return',
      tags: ['iade', 'onay'],
      usageCount: 132,
      createdAt: '2025-02-10T11:30:00',
      updatedAt: '2025-03-20T16:45:00',
      createdBy: 'Ahmet Uzman',
      isShared: true,
    },
    {
      id: '6',
      title: 'Şifre Sıfırlama Yardımı',
      content: 'Şifrenizi sıfırlamak için web sitemizin ana sayfasındaki "Şifremi Unuttum" bağlantısına tıklayın ve kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı içeren bir e-posta alacaksınız. Spam klasörünü kontrol etmeyi unutmayın.',
      category: 'technical',
      tags: ['şifre', 'sıfırlama', 'hesap'],
      usageCount: 189,
      createdAt: '2025-02-15T09:45:00',
      updatedAt: '2025-02-15T09:45:00',
      createdBy: 'Kemal Teknik',
      isShared: true,
    },
    {
      id: '7',
      title: 'Teşekkür Mesajı',
      content: 'Bize ulaştığınız için teşekkür ederiz. Yardımcı olabildiysek ne mutlu bize. Başka sorunuz olursa, bize tekrar ulaşmaktan çekinmeyin. İyi günler dileriz!',
      category: 'general',
      tags: ['teşekkür', 'kapanış'],
      usageCount: 276,
      createdAt: '2025-02-25T15:10:00',
      updatedAt: '2025-02-25T15:10:00',
      createdBy: 'Murat Görevli',
      isShared: true,
    },
  ]
  
  // Filtrelere göre hazır yanıtları sorgula
  const filteredResponses = cannedResponses.filter(response => {
    // Arama sorgusuna göre filtrele
    const matchesSearch = response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         response.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         response.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Kategoriye göre filtrele
    const matchesCategory = selectedCategory === 'all' || response.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  // Hazır yanıt kopyalama işlemi
  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Kopyalama başarılı
        console.log('Response copied to clipboard')
      })
      .catch(err => {
        // Kopyalama hatası
        console.error('Could not copy response: ', err)
      })
  }
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  return (
    <OperatorLayout title={t('cannedResponses.title', 'Hazır Yanıtlar')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('cannedResponses.title', 'Hazır Yanıtlar')}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('cannedResponses.search', 'Yanıt ara...')}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  {t('cannedResponses.addNew', 'Yeni Yanıt')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{t('cannedResponses.addNew', 'Yeni Hazır Yanıt')}</DialogTitle>
                  <DialogDescription>
                    Sık kullanılan yanıtlar için şablon oluşturun. Değişken yerleştiriciler için [Değişken Adı] formatını kullanabilirsiniz.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="responseTitle" className="text-sm font-medium">
                        Başlık
                      </label>
                      <Input
                        id="responseTitle"
                        placeholder="Yanıt başlığı"
                      />
                    </div>
                    <div>
                      <label htmlFor="responseCategory" className="text-sm font-medium">
                        Kategori
                      </label>
                      <Select>
                        <SelectTrigger id="responseCategory">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="responseContent" className="text-sm font-medium">
                      İçerik
                    </label>
                    <Textarea
                      id="responseContent"
                      placeholder="Yanıt içeriği. Değişkenleri [Değişken Adı] şeklinde belirtin. Örn: Merhaba [Müşteri Adı]"
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="responseTags" className="text-sm font-medium">
                      Etiketler
                    </label>
                    <Input
                      id="responseTags"
                      placeholder="Virgülle ayırarak etiketler girin"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox id="shareResponse" />
                    <label htmlFor="shareResponse" className="text-sm">
                      Tüm ekip ile paylaş
                    </label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">İptal</Button>
                  <Button>Kaydet</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sol kolon - Kategoriler */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Kategoriler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Button 
                  variant={selectedCategory === 'all' ? 'secondary' : 'ghost'} 
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory('all')}
                >
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tümü
                  </span>
                  <Badge>{cannedResponses.length}</Badge>
                </Button>
                
                {categories.map(category => (
                  <Button 
                    key={category.id}
                    variant={selectedCategory === category.id ? 'secondary' : 'ghost'} 
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {category.name}
                    </span>
                    <Badge>{category.count}</Badge>
                  </Button>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Kategori Ekle
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Hızlı Erişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Button variant="ghost" className="w-full justify-start">
                  <Bookmark className="h-4 w-4 mr-2 text-primary" />
                  Sık Kullanılanlar
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Son Kullanılanlar
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  Ekip Yanıtları
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  Kılavuzlar
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Info className="h-4 w-4 mr-2 text-amber-500" />
                  İpuçları
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                <p className="mb-2">Hazır yanıtlarınızda değişkenler için [Değişken Adı] formatını kullanın.</p>
                <p>Örnek: "Merhaba [Müşteri Adı], talebiniz alınmıştır."</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Orta kolon - Yanıt listesi */}
          <div className="col-span-12 md:col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Yanıt Listesi</CardTitle>
                <CardDescription>
                  {selectedCategory === 'all' 
                    ? 'Tüm hazır yanıtlar' 
                    : `${categories.find(c => c.id === selectedCategory)?.name || ''} kategorisindeki yanıtlar`}
                  ({filteredResponses.length})
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[calc(100vh-250px)]">
                <div className="space-y-2">
                  {filteredResponses.length > 0 ? (
                    filteredResponses.map(response => (
                      <div 
                        key={response.id} 
                        className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${selectedResponse?.id === response.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedResponse(response)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">{response.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {response.usageCount} kullanım
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {response.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {response.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{formatDate(response.updatedAt)}</span>
                          <div className="flex items-center">
                            {response.isShared && (
                              <Users className="h-3.5 w-3.5 mr-1" title="Ekip ile paylaşıldı" />
                            )}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <h3 className="text-lg font-medium">Yanıt Bulunamadı</h3>
                      <p className="text-sm">Arama kriterlerinize uygun yanıt bulunamadı.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sağ kolon - Yanıt detayı */}
          <div className="col-span-12 md:col-span-5">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Yanıt Detayı</CardTitle>
                <CardDescription>
                  {selectedResponse 
                    ? 'Yanıt içeriğini görüntüleyin ve düzenleyin' 
                    : 'Detayları görüntülemek için bir yanıt seçin'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedResponse ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium">{selectedResponse.title}</h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menü</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Favorilere Ekle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">
                          {categories.find(c => c.id === selectedResponse.category)?.name || selectedResponse.category}
                        </Badge>
                        {selectedResponse.isShared && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            <Users className="h-3 w-3 mr-1" />
                            Ekip ile paylaşıldı
                          </Badge>
                        )}
                      </div>
                      <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
                        {selectedResponse.content}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Etiketler</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedResponse.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Oluşturan</p>
                        <p className="font-medium">{selectedResponse.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Oluşturulma</p>
                        <p className="font-medium">{formatDate(selectedResponse.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Son Güncelleme</p>
                        <p className="font-medium">{formatDate(selectedResponse.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kullanım</p>
                        <p className="font-medium">{selectedResponse.usageCount} kez</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-1">Henüz bir yanıt seçilmedi</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detayları görüntülemek için sol taraftan bir yanıt seçin veya yeni bir yanıt oluşturun.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Yeni Yanıt Oluştur</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        {/* İçerik, yukarıdaki dialog içeriği ile aynı olacak */}
                        <DialogHeader>
                          <DialogTitle>Yeni Hazır Yanıt</DialogTitle>
                          <DialogDescription>
                            Sık kullanılan yanıtlar için şablon oluşturun.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">İptal</Button>
                          <Button>Kaydet</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
              {selectedResponse && (
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCopyResponse(selectedResponse.content)}
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Kopyala
                  </Button>
                  <Button className="gap-1">
                    <Tag className="h-4 w-4 mr-1" />
                    Yanıta Ekle
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </OperatorLayout>
  )
}

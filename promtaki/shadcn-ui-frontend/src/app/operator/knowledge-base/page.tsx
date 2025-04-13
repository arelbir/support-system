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
import { Badge } from '@/components/ui/badge'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  BookOpen, 
  PlusCircle, 
  Star, 
  Clock, 
  ThumbsUp, 
  Users, 
  Tag, 
  FileText, 
  Eye, 
  Copy, 
  Share2, 
  MoreHorizontal,
  Folder,
  FolderOpen
} from 'lucide-react'

// Bilgi bankası makalesi tipi tanımı
interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  usageCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
  };
  isFavorite: boolean;
}

export default function KnowledgeBasePage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Demo kategoriler
  const categories = [
    { id: 'general', name: 'Genel Bilgiler', count: 12 },
    { id: 'accounts', name: 'Hesap Yönetimi', count: 18 },
    { id: 'payments', name: 'Ödeme İşlemleri', count: 15 },
    { id: 'products', name: 'Ürün Bilgileri', count: 22 },
    { id: 'returns', name: 'İade ve Değişim', count: 14 },
    { id: 'shipping', name: 'Kargo ve Teslimat', count: 9 },
    { id: 'technical', name: 'Teknik Sorunlar', count: 16 },
  ]
  
  // Demo makaleler
  const articles: KnowledgeArticle[] = [
    {
      id: '42',
      title: 'Ödeme İşlemi Başarısız Olduğunda Yapılması Gerekenler',
      summary: 'Müşteriler ödeme işlemi sırasında hata aldığında izlenecek adımlar',
      content: '...',
      category: 'payments',
      tags: ['ödeme', 'hata', 'kredi kartı', 'havale'],
      views: 1245,
      usageCount: 82,
      likes: 24,
      createdAt: '2025-02-15T10:30:00',
      updatedAt: '2025-03-20T14:15:00',
      author: {
        name: 'Ahmet Uzman',
        role: 'Teknik Müdür',
      },
      isFavorite: true,
    },
    {
      id: '38',
      title: 'Şifre Sıfırlama İşlemi Nasıl Yapılır',
      summary: 'Müşteriler şifrelerini unuttukları durumda izleyecekleri adımlar',
      content: '...',
      category: 'accounts',
      tags: ['şifre', 'hesap', 'erişim'],
      views: 2541,
      usageCount: 145,
      likes: 36,
      createdAt: '2025-01-10T09:45:00',
      updatedAt: '2025-03-18T11:30:00',
      author: {
        name: 'Zeynep Yardım',
        role: 'Müşteri Destek Uzmanı',
      },
      isFavorite: true,
    },
    {
      id: '53',
      title: 'İade Talebi Nasıl Oluşturulur',
      summary: 'Müşteriler için iade talebinin adım adım açıklaması',
      content: '...',
      category: 'returns',
      tags: ['iade', 'geri ödeme', 'ürün iadesi'],
      views: 1876,
      usageCount: 95,
      likes: 28,
      createdAt: '2025-02-28T13:20:00',
      updatedAt: '2025-04-01T16:40:00',
      author: {
        name: 'Murat Görevli',
        role: 'Ürün Uzmanı',
      },
      isFavorite: false,
    },
    {
      id: '67',
      title: 'Kargo Takibi Yapma Yöntemleri',
      summary: 'Müşterilerin kargo durumunu nasıl kontrol edebilecekleri',
      content: '...',
      category: 'shipping',
      tags: ['kargo', 'teslimat', 'takip'],
      views: 3150,
      usageCount: 112,
      likes: 41,
      createdAt: '2025-03-05T11:10:00',
      updatedAt: '2025-04-05T09:25:00',
      author: {
        name: 'Elif Sevgi',
        role: 'Lojistik Uzmanı',
      },
      isFavorite: false,
    },
    {
      id: '29',
      title: 'Web Sitesi Hataları ve Çözümleri',
      summary: 'Sık karşılaşılan web sitesi hataları ve hızlı çözüm yöntemleri',
      content: '...',
      category: 'technical',
      tags: ['hata', 'web sitesi', 'teknik sorun', 'browser'],
      views: 1650,
      usageCount: 76,
      likes: 19,
      createdAt: '2025-01-20T15:30:00',
      updatedAt: '2025-03-15T14:20:00',
      author: {
        name: 'Kemal Teknik',
        role: 'Teknik Destek Uzmanı',
      },
      isFavorite: false,
    },
  ]
  
  // Kategoriye göre makaleleri filtrele
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  // Makale kartı bileşeni
  const ArticleCard = ({ article }: { article: KnowledgeArticle }) => {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              <a href={`/operator/knowledge-base/${article.id}`} className="hover:underline">
                {article.title}
              </a>
              {article.isFavorite && (
                <Star className="inline-block h-4 w-4 text-amber-500 ml-2 mb-1" />
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menü</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <Eye className="h-4 w-4" />
                  Görüntüle
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Copy className="h-4 w-4" />
                  İçeriği Kopyala
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Paylaş
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Star className="h-4 w-4" />
                  {article.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{article.summary}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{article.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Copy className="h-3.5 w-3.5" />
              <span>{article.usageCount} kullanım</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{article.likes}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            <span>Güncelleme: {formatDate(article.updatedAt)}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Copy className="h-3.5 w-3.5" />
            Kopyala
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <OperatorLayout title={t('knowledgeBase.title', 'Bilgi Bankası')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('knowledgeBase.title', 'Bilgi Bankası')}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('knowledgeBase.search', 'Bilgi bankasında ara...')}
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4 mr-1" />
              {t('knowledgeBase.createNew', 'Yeni Makale')}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="articles">
              <FileText className="h-4 w-4 mr-2" />
              Makaleler
            </TabsTrigger>
            <TabsTrigger value="categories">
              <FolderOpen className="h-4 w-4 mr-2" />
              Kategoriler
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favoriler
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles" className="space-y-4">
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
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tümü
                      </span>
                      <Badge>{articles.length}</Badge>
                    </Button>
                    
                    {categories.map(category => (
                      <Button 
                        key={category.id}
                        variant={selectedCategory === category.id ? 'secondary' : 'ghost'} 
                        className="w-full justify-between"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="flex items-center">
                          <Folder className="h-4 w-4 mr-2" />
                          {category.name}
                        </span>
                        <Badge>{category.count}</Badge>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Filtreler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Sırala</span>
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <Clock className="h-4 w-4" />
                          En Son Güncellenen
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <ThumbsUp className="h-4 w-4" />
                          En Çok Beğenilen
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <Eye className="h-4 w-4" />
                          En Çok Görüntülenen
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                          <Copy className="h-4 w-4" />
                          En Çok Kullanılan
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Popüler Etiketler</span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="cursor-pointer">ödeme</Badge>
                        <Badge variant="outline" className="cursor-pointer">hesap</Badge>
                        <Badge variant="outline" className="cursor-pointer">iade</Badge>
                        <Badge variant="outline" className="cursor-pointer">kargo</Badge>
                        <Badge variant="outline" className="cursor-pointer">şifre</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sağ kolon - Makale listesi */}
              <div className="col-span-12 md:col-span-9">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center p-8 text-muted-foreground">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <h3 className="text-lg font-medium">Sonuç Bulunamadı</h3>
                        <p className="text-sm">Arama kriterlerinize uygun makale bulunamadı.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FolderOpen className="h-5 w-5 mr-2 text-primary" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.count} makale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Bu kategorideki makalelere göz atın.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedCategory(category.id)
                        document.querySelector('[data-state="inactive"][value="articles"]')?.click()
                      }}
                    >
                      Makaleleri Görüntüle
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.filter(a => a.isFavorite).map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  )
}

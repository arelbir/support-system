'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Tag as TagIcon, AlertCircle, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import ticketService, { CreateTicketData, TicketPriority } from '@/services/ticketServiceV2'

interface CreateTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: {
    subject?: string
    category?: string
    priority?: string
    description?: string
    tags?: string[]
  }
  mode?: 'create' | 'edit'
  ticketId?: string
}

export function CreateTicketModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  mode = 'create',
  ticketId,
}: CreateTicketModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  
  // Bilet şeması
  const ticketSchema = z.object({
    subject: z.string().min(5, t('validation.subjectMinLength', { length: 5 })),
    category: z.string().min(1, t('validation.required')),
    priority: z.string().min(1, t('validation.required')),
    description: z.string().min(20, t('validation.descriptionMinLength', { length: 20 })),
    tags: z.array(z.string()).optional(),
  })
  
  // Kategoriler
  const categories = [
    { value: 'technical', label: 'Teknik Destek' },
    { value: 'billing', label: 'Ödeme ve Fatura' },
    { value: 'account', label: 'Hesap Yönetimi' },
    { value: 'general', label: 'Genel Sorular' },
  ]
  
  // Öncelikler
  const priorities = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' },
  ]
  
  // Form
  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      category: initialData?.category || '',
      priority: initialData?.priority || 'medium',
      description: initialData?.description || '',
      tags: initialData?.tags || [],
    },
  })

  // Bilet oluşturma/güncelleme mutasyonu
  const ticketMutation = useMutation({
    mutationFn: (data: CreateTicketData) => {
      if (mode === 'create') {
        return ticketService.createTicket(data)
      } else if (mode === 'edit' && ticketId) {
        return ticketService.updateTicket(parseInt(ticketId), data)
      }
      throw new Error('Invalid mode or missing ticketId')
    },
    onSuccess: () => {
      // Bilet listesini yenile
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })
      
      toast({
        title: mode === 'create' ? 'Bilet oluşturuldu' : 'Bilet güncellendi',
        description: mode === 'create' 
          ? 'Destek talebiniz başarıyla oluşturuldu.' 
          : 'Destek talebiniz başarıyla güncellendi.',
      })
      
      // Başarılı callback
      if (onSuccess) {
        onSuccess()
      }
      
      // Modalı kapat
      onOpenChange(false)
      
      // Formu sıfırla
      form.reset()
      setFiles([])
    },
    onError: (error) => {
      toast({
        title: 'Hata!',
        description: 'Bilet işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      })
      console.error('Bilet işlemi hatası:', error)
    }
  })
  
  // Dosya yükleme işleyicisi
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
  }
  
  // Dosya kaldırma işleyicisi
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }
  
  // Etiket ekleme işleyicisi
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault()
      const currentTags = form.getValues('tags') || []
      
      // Etiket zaten var mı kontrol et
      if (!currentTags.includes(newTag.toLowerCase().trim())) {
        form.setValue('tags', [...currentTags, newTag.toLowerCase().trim()])
      }
      
      setNewTag('')
    }
  }
  
  // Etiket kaldırma işleyicisi
  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue('tags', currentTags.filter(t => t !== tag))
  }
  
  // Form gönderme işleyicisi
  const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
    setIsSubmitting(true)
    
    try {
      // Form değerlerini API'nin beklediği formata dönüştür
      const ticketData: CreateTicketData = {
        subject: values.subject,
        description: values.description,
        priority: values.priority as TicketPriority,
        category: values.category,
        // Ek alanlar
        tagIds: [], // API entegrasyonunda tag ID'leri gönderilmeli, şimdilik boş
        attachments: files
      }
      
      await ticketMutation.mutateAsync(ticketData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('tickets.createTicket') : t('tickets.editTicket')}
            {mode === 'edit' && ticketId && ` #${ticketId}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? t('tickets.createTicketDescription') 
              : t('tickets.editTicketDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              {t('tickets.details')}
            </TabsTrigger>
            <TabsTrigger value="attachments">
              {t('tickets.attachments')}
              {files.length > 0 && (
                <Badge variant="secondary" className="ml-2">{files.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tickets.subject')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('tickets.subjectPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('tickets.category')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('tickets.selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('tickets.priority')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('tickets.selectPriority')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tickets.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('tickets.descriptionPlaceholder')} 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {t('tickets.descriptionHelp')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>{t('tickets.tags')}</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch('tags')?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-2 py-1">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder={t('tickets.addTag')}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('tickets.tagsHelp')}
                  </p>
                </div>
                
                {mode === 'edit' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('common.note')}</AlertTitle>
                    <AlertDescription>
                      {t('tickets.editWarning')}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="attachments" className="py-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="mb-2 text-sm">{t('tickets.dropFiles')}</p>
                    <p className="text-xs text-muted-foreground mb-4">{t('tickets.fileSizeLimit')}</p>
                    
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="secondary">
                          {t('tickets.selectFiles')}
                        </Button>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{t('tickets.selectedFiles')}</h4>
                      {files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex-shrink-0 w-10 h-10 bg-background rounded flex items-center justify-center">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="text-xs font-medium">
                                  {file.name.split('.').pop()?.toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(file.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? t('common.submitting') 
                    : mode === 'create'
                      ? t('tickets.createTicket')
                      : t('tickets.saveChanges')
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

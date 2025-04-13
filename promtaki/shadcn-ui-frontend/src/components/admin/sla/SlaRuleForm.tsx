import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlaRule } from './SlaRulesList'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Kural adı en az 2 karakter olmalıdır',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  firstResponseTime: z.coerce.number().min(0.1, {
    message: 'İlk yanıt süresi en az 0.1 saat olmalıdır',
  }),
  resolutionTime: z.coerce.number().min(0.1, {
    message: 'Çözüm süresi en az 0.1 saat olmalıdır',
  }),
  businessHours: z.boolean().default(true),
  active: z.boolean().default(true),
})

interface SlaRuleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: SlaRule
  onSubmit: (data: SlaRule) => void
}

export function SlaRuleForm({ open, onOpenChange, initialData, onSubmit }: SlaRuleFormProps) {
  const isEditing = !!initialData
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      priority: 'medium',
      firstResponseTime: 4,
      resolutionTime: 24,
      businessHours: true,
      active: true,
    },
  })
  
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      id: initialData?.id || `sla-${Date.now()}`,
      ...values,
    })
    form.reset()
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'SLA Kuralını Düzenle' : 'Yeni SLA Kuralı'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Mevcut SLA kuralını güncelleyin.' 
              : 'Yeni bir SLA kuralı oluşturun. Her öncelik seviyesi için farklı yanıt ve çözüm süreleri tanımlayabilirsiniz.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kural Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Kural adı giriniz" {...field} />
                  </FormControl>
                  <FormDescription>
                    Örnek: "Düşük Öncelikli Biletler" veya "VIP Müşteri SLA"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Öncelik</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="urgent">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Bu SLA'nın uygulanacağı bilet önceliği
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstResponseTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İlk Yanıt Süresi (saat)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Saat cinsinden ilk yanıt süresi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resolutionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çözüm Süresi (saat)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Saat cinsinden toplam çözüm süresi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Sadece Çalışma Saatleri</FormLabel>
                      <FormDescription>
                        SLA zamanı yalnızca çalışma saatleri içinde sayılır
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aktif</FormLabel>
                      <FormDescription>
                        Bu SLA kuralının aktif olup olmadığı
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit">
                {isEditing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

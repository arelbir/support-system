import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart4, Download, FileSpreadsheet, RefreshCw } from 'lucide-react'

interface ReportCardProps {
  title: string
  description: string
  icon: React.ReactNode
  lastUpdated: string
  onGenerate: () => void
  onDownload: () => void
}

export function ReportCard({
  title,
  description,
  icon,
  lastUpdated,
  onGenerate,
  onDownload
}: ReportCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          Son güncelleme: {lastUpdated}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={onGenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Güncelle
          </Button>
          <Button variant="secondary" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            İndir
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

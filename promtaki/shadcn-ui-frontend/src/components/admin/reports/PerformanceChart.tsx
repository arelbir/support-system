import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveLine } from '@nivo/line'
import { BarChart4 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PerformanceDataPoint {
  x: string
  y: number
}

interface PerformanceData {
  id: string
  data: PerformanceDataPoint[]
  color?: string
}

interface PerformanceChartProps {
  title: string
  description: string
  performanceData: PerformanceData[]
}

export function PerformanceChart({ title, description, performanceData }: PerformanceChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
        
        <Tabs defaultValue="week" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Hafta</TabsTrigger>
            <TabsTrigger value="month">Ay</TabsTrigger>
            <TabsTrigger value="year">Yıl</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveLine
            data={performanceData}
            margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Tarih',
              legendOffset: 40,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Bilet Sayısı',
              legendOffset: -50,
              legendPosition: 'middle'
            }}
            colors={{ scheme: 'category10' }}
            lineWidth={3}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableArea={true}
            areaOpacity={0.1}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 100,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}

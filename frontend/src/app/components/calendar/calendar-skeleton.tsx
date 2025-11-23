"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CalendarSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Calendario</h2>
        <p className="text-muted-foreground">Eventos de medicinas</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="w-10 h-10 rounded" />
                <Skeleton className="w-10 h-10 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


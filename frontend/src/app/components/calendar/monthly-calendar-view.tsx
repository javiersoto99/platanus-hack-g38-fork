"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"
import type { CalendarEvent } from "@/app/components/calendar/types"

interface MonthlyCalendarViewProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onDayClick: (day: number) => void
  getEventsForDay: (day: number) => CalendarEvent[]
  hoveredDate: number | null
  setHoveredDate: (date: number | null) => void
}

export function MonthlyCalendarView({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onDayClick,
  getEventsForDay,
  hoveredDate,
  setHoveredDate,
}: MonthlyCalendarViewProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"]

  const getDaySummary = (day: number) => {
    const events = getEventsForDay(day)
    const medicineEvents = events.filter((e) => e.type === "medicine")
    return {
      total: medicineEvents.length,
      completed: medicineEvents.filter((e) => e.status === "success").length,
      pending: medicineEvents.filter((e) => e.status === "pending").length,
      rejected: medicineEvents.filter((e) => e.status === "failed").length,
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-foreground">Calendario</h2>
        <p className="text-muted-foreground mt-1">Eventos de medicinas</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={onPreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={onNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day)
                const daySummary = getDaySummary(day)
                const isHovered = hoveredDate === day && daySummary.total > 0

                return (
                  <div key={day} className="relative">
                    <button
                      onClick={() => onDayClick(day)}
                      onMouseEnter={() => daySummary.total > 0 && setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={clsx(
                        "w-full aspect-square rounded-lg p-2 flex flex-col items-start justify-start transition-all duration-200 relative group",
                        currentDate.getDate() === day && "ring-2 ring-primary",
                        dayEvents.length > 0 && "bg-muted hover:bg-muted/80 cursor-pointer",
                        !dayEvents.length && "hover:bg-muted/50 cursor-pointer",
                      )}
                    >
                      <span className={clsx("text-xs font-semibold", currentDate.getDate() === day && "text-primary")}>
                        {day}
                      </span>
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={clsx(
                            "w-full text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 line-clamp-1",
                            event.type === "medicine" ? "bg-primary/20 text-primary" : "bg-blue-100 text-blue-600",
                          )}
                          title={event.title}
                        >
                          {event.type === "medicine" ? "💊" : "🏥"} {event.title.slice(0, 10)}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="w-full text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 text-muted-foreground">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </button>

                    {isHovered && (
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-1">
                        <Card className="bg-card border-border shadow-lg p-3 w-48">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            {currentDate.getDate() === day ? "Hoy" : `${day} ${monthNames[currentDate.getMonth()]}`}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-bold text-green-600">{daySummary.completed}</span>
                              <span className="text-muted-foreground"> completados</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-bold text-yellow-600">{daySummary.pending}</span>
                              <span className="text-muted-foreground"> pendientes</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-bold text-red-600">{daySummary.rejected}</span>
                              <span className="text-muted-foreground"> rechazados</span>
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

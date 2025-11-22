"use client"

import { ChevronLeft } from "lucide-react"
import clsx from "clsx"
import type { CalendarEvent } from "@/app/components/calendar/types"

interface DailyCalendarViewProps {
  currentDate: Date
  selectedDay: number
  dayEvents: CalendarEvent[]
  onBackToMonth: () => void
  onEventClick: (event: CalendarEvent) => void
}

const generateHourlySlots = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${String(i).padStart(2, "0")}:00`,
  }))
}

export function DailyCalendarView({
  currentDate,
  selectedDay,
  dayEvents,
  onBackToMonth,
  onEventClick,
}: DailyCalendarViewProps) {
  const hourlySlots = generateHourlySlots()
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

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div>
          <button
            onClick={onBackToMonth}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <h2 className="text-3xl font-bold text-foreground">
            {dayNames[new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).getDay()]}, {selectedDay}{" "}
            de {monthNames[currentDate.getMonth()]}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-0 max-w-4xl">
          {hourlySlots.map((slot) => {
            const eventsInHour = dayEvents.filter((event) => {
              const eventHour = Number.parseInt(event.time.split(":")[0])
              return eventHour === slot.hour
            })

            return (
              <div key={slot.hour} className="flex gap-3 min-h-14 border-b border-border/50 last:border-b-0">
                <div className="w-10 pt-1 flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">{slot.label}</span>
                </div>

                <div className="flex-1 py-1 pr-4 space-y-1.5">
                  {eventsInHour.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={clsx(
                        "w-full p-2 rounded-lg text-left transition-all duration-200 cursor-pointer hover:shadow-md text-sm",
                        event.type === "medicine"
                          ? "bg-primary/10 border border-primary/30 hover:bg-primary/15"
                          : "bg-accent/10 border border-accent/30 hover:bg-accent/15",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                          {event.type === "medicine" && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className={clsx(
                                  "text-xs px-1.5 py-0.5 rounded font-medium",
                                  event.status === "success"
                                    ? "bg-green-100 text-green-700"
                                    : event.status === "failed"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700",
                                )}
                              >
                                {event.status === "success"
                                  ? "✓ Tomado"
                                  : event.status === "failed"
                                    ? "✗ No respondió"
                                    : "⏳ Pendiente"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className={clsx(
                            "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-sm",
                            event.type === "medicine" ? "bg-primary/20" : "bg-accent/20",
                          )}
                        >
                          {event.type === "medicine" ? "💊" : "🏥"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

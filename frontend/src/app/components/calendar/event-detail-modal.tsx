"use client"

import { X, Clock, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import clsx from "clsx"
import type { CalendarEvent } from "@/app/components/calendar/types"

interface EventDetailModalProps {
  event: CalendarEvent
  onClose: () => void
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
        <Card className="bg-card border-border w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Fixed Header with 6px horizontal and 2px vertical padding */}
          <div className="px-[6px] py-[2px] border-b border-border flex items-start justify-between sticky top-0 bg-card rounded-t-lg z-10">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
                  event.type === "medicine" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent",
                )}
              >
                {event.type === "medicine" ? "💊" : "🏥"}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  {event.type === "medicine" ? "Medicina" : "Cita Médica"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div>
              <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Hora</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{event.time}</p>
              </div>
            </div>

            {event.duration && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duración</p>
                <p className="text-sm font-medium text-foreground">{event.duration} minutos</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Detalles</p>
              <p className="text-sm text-foreground">{event.description}</p>
            </div>

            {event.type === "medicine" && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Estado del recordatorio</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm text-foreground">Estado</span>
                    <span
                      className={clsx(
                        "text-xs px-2 py-1 rounded font-medium",
                        event.status === "success"
                          ? "bg-green-100 text-green-700"
                          : event.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700",
                      )}
                    >
                      {event.status === "success" ? "Tomado" : event.status === "failed" ? "No respondió" : "Pendiente"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm text-foreground">Intentos</span>
                    <span className="text-sm font-medium">
                      {event.retries}/{event.maxRetries}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm text-foreground">Método de contacto</span>
                    <div className="flex items-center gap-1">
                      {event.contactMethod === "whatsapp" ? (
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Phone className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {event.contactMethod === "whatsapp" ? "WhatsApp" : "Llamada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with 6px horizontal and 2px vertical padding */}
          <div className="px-[6px] py-[2px] border-t border-border space-y-2 flex-shrink-0 bg-card rounded-b-lg sticky bottom-0 z-10">
            <Button className="w-full bg-primary hover:bg-primary/90">
              {event.type === "medicine" ? "Marcar como tomado" : "Ver más detalles"}
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Configurar
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

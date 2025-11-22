"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Pill, RotateCcw, History, Check } from "lucide-react"
import { ReminderInstance } from "./types"
import ReminderLogModal from "./reminder-log-modal"

interface TimelineItemProps {
  instance: ReminderInstance
  onRectify?: (id: number) => void
}

export function TimelineItem({ instance, onRectify }: TimelineItemProps) {
  const [showLog, setShowLog] = useState(false)

  return (
    <div className="relative flex gap-6">
      {/* Timeline dot */}
      <div
        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-background ${
          instance.status === "success"
            ? "bg-green-500"
            : instance.status === "failed"
              ? "bg-red-500"
              : "bg-gray-300"
        }`}
      >
        {instance.method === "whatsapp" || !instance.method ? (
          <MessageCircle className="w-5 h-5 text-white" />
        ) : (
          <Phone className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Event Card */}
      <Card className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-muted-foreground">
                {new Date(instance.scheduled_datetime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  instance.status === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : instance.status === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {instance.status === "success"
                  ? "Tomado"
                  : instance.status === "failed"
                    ? "No tomado"
                    : "Pendiente"}
              </span>
            </div>

            <h4 className="text-lg font-bold text-foreground">{instance.medicine_name}</h4>
            <p className="text-sm text-muted-foreground">{instance.dosage}</p>

            {instance.retry_count && instance.retry_count > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                <span>{instance.retry_count} reintentos</span>
              </div>
            )}

            {instance.taken_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Confirmado: {" "}
                {new Date(instance.taken_at).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {instance.status === "failed" && onRectify && (
                <Button size="sm" variant="outline" onClick={() => onRectify(instance.id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Rectificar
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setShowLog(true)} aria-label="Ver historial">
                <History className="w-5 h-5" />
              </Button>
            </div>
            <Pill className="w-8 h-8 text-primary" />
          </div>
        </div>
      </Card>

      <ReminderLogModal isOpen={showLog} onClose={() => setShowLog(false)} instance={instance} />
    </div>
  )
}

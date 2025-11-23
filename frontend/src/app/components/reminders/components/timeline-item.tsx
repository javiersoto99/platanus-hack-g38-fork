"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MessageCircle, Phone, Pill, RotateCcw, History } from "lucide-react"
import { ReminderInstance } from "./types"
import ReminderLogModal from "./reminder-log-modal"

interface TimelineItemProps {
  instance: ReminderInstance
  onRectify?: (id: number) => void
  isMarking?: boolean
}

export function TimelineItem({ instance, onRectify, isMarking = false }: TimelineItemProps) {
  const [showLog, setShowLog] = useState(false)

  return (
    <div className="relative flex gap-6">
      {/* Timeline dot */}
      <div
        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-background ${
          instance.status === "success"
            ? "bg-green-500"
            : instance.status === "failed" || instance.status === "failure" || instance.status === "rejected"
              ? "bg-red-500"
              : instance.status === "waiting"
                ? "bg-yellow-500"
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
                    : instance.status === "failed" || instance.status === "failure" || instance.status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : instance.status === "waiting"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {instance.status === "success"
                  ? "Tomado"
                  : instance.status === "failed"
                    ? "Fallido"
                    : instance.status === "failure"
                      ? "Error"
                      : instance.status === "rejected"
                        ? "Rechazado"
                        : instance.status === "waiting"
                          ? "Esperando"
                          : "Pendiente"}
              </span>
            </div>

            <h4 className="text-lg font-bold text-foreground">{instance.medicine_name}</h4>
            <p className="text-sm text-muted-foreground">{instance.dosage}</p>

            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3" />
              <span>Intentos: {instance.retry_count || 0}</span>
            </div>

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
              <Button variant="ghost" size="icon" onClick={() => setShowLog(true)} aria-label="Ver historial">
                <History className="w-5 h-5" />
              </Button>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (onRectify && instance.status !== "success" && !isMarking) {
                      onRectify(instance.id)
                    }
                  }}
                  disabled={isMarking || instance.status === "success"}
                  className={`relative z-10 transition-all duration-200 p-2 rounded-md touch-manipulation ${
                    instance.status === "success"
                      ? "text-green-600 cursor-default"
                      : instance.status !== "success" && !isMarking
                        ? "text-primary hover:text-primary/80 hover:bg-primary/10 hover:scale-110 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        : "text-muted-foreground cursor-default"
                  } ${isMarking ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={instance.status === "success" ? "Medicamento tomado" : "Marcar como tomado"}
                  type="button"
                >
                  <Pill className="w-8 h-8 pointer-events-none" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {instance.status === "success" ? "Medicamento tomado" : "Marcar como tomado"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>

      <ReminderLogModal isOpen={showLog} onClose={() => setShowLog(false)} instance={instance} />
    </div>
  )
}

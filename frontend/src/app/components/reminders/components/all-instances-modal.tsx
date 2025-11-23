"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Loader2 } from "lucide-react"
import { ReminderInstance } from "./types"
import { api } from "@/lib/api"

interface AllInstancesModalProps {
  isOpen: boolean
  onClose: () => void
  reminderId: number
  medicineName?: string
}

export function AllInstancesModal({
  isOpen,
  onClose,
  reminderId,
  medicineName,
}: AllInstancesModalProps) {
  const [instances, setInstances] = useState<ReminderInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInstances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getReminderInstancesByReminderWithMedicine(reminderId)
      setInstances(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar recordatorios")
      console.error("Error loading instances:", err)
    } finally {
      setLoading(false)
    }
  }, [reminderId])

  useEffect(() => {
    if (isOpen && reminderId) {
      loadInstances()
    }
  }, [isOpen, reminderId, loadInstances])

  const statusColors = {
    success: "bg-green-500",
    failed: "bg-red-500",
    failure: "bg-red-500",
    waiting: "bg-yellow-500",
    pending: "bg-gray-400",
  }
  const statusLabels = {
    success: "Tomado",
    failed: "Fallido",
    failure: "Fallido",
    waiting: "Esperando",
    pending: "Pendiente",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Historial de Recordatorios {medicineName && `- ${medicineName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={loadInstances}>
                Reintentar
              </Button>
            </div>
          ) : instances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No hay recordatorios registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((instance) => {
                const statusColor =
                  statusColors[instance.status as keyof typeof statusColors] || "bg-gray-400"
                const statusLabel =
                  statusLabels[instance.status as keyof typeof statusLabels] || instance.status

                return (
                  <div
                    key={instance.id}
                    className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Status dot */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColor}`} />

                    {/* Method icon */}
                    <div className="flex-shrink-0">
                      {instance.method === "whatsapp" || !instance.method ? (
                        <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Date and time */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">
                        {new Date(instance.scheduled_datetime).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(instance.scheduled_datetime).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          instance.status === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : instance.status === "failed" || instance.status === "failure"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {statusLabel}
                      </span>
                      {instance.taken_at && (
                        <span className="text-xs text-muted-foreground">
                          Confirmado:{" "}
                          {new Date(instance.taken_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


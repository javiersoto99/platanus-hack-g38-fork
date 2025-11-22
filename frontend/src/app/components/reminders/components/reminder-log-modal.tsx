"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReminderInstance } from "./types"

interface LogEntry {
  id: string
  time: string
  status: string
  note?: string
}

interface ReminderLogModalProps {
  isOpen: boolean
  onClose: () => void
  instance: ReminderInstance
}

function format(dt?: string | null) {
  if (!dt) return new Date().toLocaleString("es-ES")
  try {
    const d = new Date(dt)
    if (isNaN(d.getTime())) return new Date().toLocaleString("es-ES")
    return d.toLocaleString("es-ES")
  } catch {
    return new Date().toLocaleString("es-ES")
  }
}

export function ReminderLogModal({ isOpen, onClose, instance }: ReminderLogModalProps) {
  // build a simple mock log from instance data for demonstration
  const entries: LogEntry[] = []

  const retryCount = instance.retry_count ?? 0
  const method = instance.method || "desconocido"
  const medicineName = instance.medicine_name || "Medicamento"

  // initial send
  entries.push({ 
    id: "e1", 
    time: format(instance.scheduled_datetime), 
    status: "Recordatorio enviado (primer intento)", 
    note: `Método: ${method === "whatsapp" ? "WhatsApp" : method === "call" ? "Llamada" : method}` 
  })

  // retries
  if (retryCount > 0) {
    for (let i = 1; i <= retryCount; i++) {
      entries.push({ 
        id: `r${i}`, 
        time: format(), 
        status: `Recordatorio enviado (reintento ${i})`, 
        note: `Método: ${method === "whatsapp" ? "WhatsApp" : method === "call" ? "Llamada" : method}` 
      })
    }
  }

  // status-specific entries
  if (instance.status === "pending") {
    entries.push({ id: "w1", time: format(), status: "A la espera de confirmación" })
    entries.push({ id: "w2", time: format(), status: "Sin respuesta" })
  } else if (instance.status === "success") {
    entries.push({ 
      id: "s1", 
      time: format(instance.taken_at), 
      status: "Confirmado → Tomado" 
    })
  } else if (instance.status === "failed") {
    entries.push({ id: "f1", time: format(), status: "Confirmado → No tomado" })
    if (instance.family_notified) {
      entries.push({ 
        id: "es1", 
        time: format(instance.family_notified_at), 
        status: "Escalado a familia" 
      })
    }
  }

  entries.push({ id: "c1", time: format(), status: "Cierre de toma" })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial - {medicineName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay registros disponibles
            </p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground">{e.time}</div>
                <div className="font-medium">{e.status}</div>
                {e.note && <div className="text-xs text-muted-foreground mt-1">{e.note}</div>}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReminderLogModal
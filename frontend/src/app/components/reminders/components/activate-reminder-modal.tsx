"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Reminder } from "./types"

interface ActivateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  reminder: Reminder | null
  onConfirm: () => void
}

export function ActivateReminderModal({
  isOpen,
  onClose,
  reminder,
  onConfirm,
}: ActivateReminderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activar Recordatorio - {reminder?.medicine?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Confirma o actualiza la información del medicamento y el recordatorio para reactivarlo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Total de pastillas</label>
              <input
                type="number"
                defaultValue={reminder?.medicine?.total_tablets || 0}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Pastillas restantes</label>
              <input
                type="number"
                defaultValue={reminder?.medicine?.tablets_left || 0}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Periodicidad</label>
            <select
              defaultValue={reminder?.periodicity || ""}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option>Cada 8 horas</option>
              <option>Cada 12 horas</option>
              <option>Diario</option>
              <option>Cada 2 días</option>
              <option>Semanal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Fecha de inicio</label>
              <input
                type="date"
                defaultValue={reminder?.start_date}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Fecha de fin (opcional)</label>
              <input
                type="date"
                defaultValue={reminder?.end_date || ""}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={onConfirm}>
            Activar Recordatorio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

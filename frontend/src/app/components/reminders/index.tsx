"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Pill,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Edit,
  Power,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  AlertCircle,
} from "lucide-react"

interface Reminder {
  id: number
  reminder_type: string
  periodicity: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  medicine?: Medicine
  executions: ReminderExecution[]
}

interface Medicine {
  id: number
  name: string
  dosage: string | null
  total_tablets: number | null
  tablets_left: number | null
  tablets_per_dose: number
  notes: string | null
}

interface ReminderExecution {
  id: number
  executed_at: string
  status: "success" | "failed" | "pending"
  method: "whatsapp" | "call"
  retries: number
  duration_minutes: number
}

// Mock data
const mockReminders: Reminder[] = [
  {
    id: 1,
    reminder_type: "medicine",
    periodicity: "Cada 8 horas",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    is_active: true,
    medicine: {
      id: 1,
      name: "Aspirina",
      dosage: "500mg",
      total_tablets: 60,
      tablets_left: 42,
      tablets_per_dose: 1,
      notes: "Tomar con comida",
    },
    executions: [
      {
        id: 1,
        executed_at: "2024-11-22 08:00",
        status: "success",
        method: "whatsapp",
        retries: 0,
        duration_minutes: 2,
      },
      { id: 2, executed_at: "2024-11-22 16:00", status: "success", method: "call", retries: 1, duration_minutes: 5 },
      {
        id: 3,
        executed_at: "2024-11-23 00:00",
        status: "failed",
        method: "whatsapp",
        retries: 3,
        duration_minutes: 15,
      },
    ],
  },
  {
    id: 2,
    reminder_type: "medicine",
    periodicity: "Cada 12 horas",
    start_date: "2024-01-15",
    end_date: null,
    is_active: true,
    medicine: {
      id: 2,
      name: "Insulina",
      dosage: "10 unidades",
      total_tablets: 30,
      tablets_left: 8,
      tablets_per_dose: 1,
      notes: "Aplicar antes de las comidas",
    },
    executions: [
      {
        id: 4,
        executed_at: "2024-11-22 07:00",
        status: "success",
        method: "whatsapp",
        retries: 0,
        duration_minutes: 1,
      },
      {
        id: 5,
        executed_at: "2024-11-22 19:00",
        status: "success",
        method: "whatsapp",
        retries: 0,
        duration_minutes: 3,
      },
    ],
  },
  {
    id: 3,
    reminder_type: "medicine",
    periodicity: "Diario",
    start_date: "2024-02-01",
    end_date: "2024-06-30",
    is_active: false,
    medicine: {
      id: 3,
      name: "Omeprazol",
      dosage: "20mg",
      total_tablets: 30,
      tablets_left: 0,
      tablets_per_dose: 1,
      notes: "En ayunas",
    },
    executions: [],
  },
]

const mockReminderInstances = [
  {
    id: 1,
    reminder_id: 1,
    scheduled_datetime: "2024-11-22 08:00",
    status: "success",
    taken_at: "2024-11-22 08:05",
    retry_count: 0,
    max_retries: 3,
    method: "whatsapp",
    medicine_name: "Aspirina",
    dosage: "500mg",
  },
  {
    id: 2,
    reminder_id: 1,
    scheduled_datetime: "2024-11-22 16:00",
    status: "failed",
    taken_at: null,
    retry_count: 3,
    max_retries: 3,
    method: "call",
    medicine_name: "Aspirina",
    dosage: "500mg",
  },
  {
    id: 3,
    reminder_id: 2,
    scheduled_datetime: "2024-11-22 19:00",
    status: "success",
    taken_at: "2024-11-22 19:02",
    retry_count: 1,
    max_retries: 3,
    method: "whatsapp",
    medicine_name: "Insulina",
    dosage: "10 unidades",
  },
  {
    id: 4,
    reminder_id: 1,
    scheduled_datetime: "2024-11-22 23:59",
    status: "pending",
    taken_at: null,
    retry_count: 0,
    max_retries: 3,
    method: "whatsapp",
    medicine_name: "Aspirina",
    dosage: "500mg",
  },
]

export function RemindersView() {
  const [activeTab, setActiveTab] = useState<"today" | "config">("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [showMedicineDetail, setShowMedicineDetail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)

  const filteredReminders = mockReminders.filter((reminder) => {
    const matchesSearch = reminder.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === null || reminder.is_active === filterActive
    return matchesSearch && matchesFilter
  })

  const getRecentExecutions = (executions: ReminderExecution[]) => {
    return executions
      .filter((e) => e.status !== "pending")
      .slice(-5)
      .reverse()
  }

  const handleToggleActive = (reminder: Reminder) => {
    if (reminder.is_active) {
      // Deactivate immediately
      console.log("[v0] Deactivating reminder", reminder.id)
    } else {
      // Show dialog to reactivate
      setSelectedReminder(reminder)
      setShowActivateDialog(true)
    }
  }

  const handleDeleteReminder = () => {
    console.log("[v0] Deleting reminder", selectedReminder?.id)
    setShowDeleteDialog(false)
    setShowMedicineDetail(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Recordatorios</h2>
            <p className="text-muted-foreground mt-1">Gestiona los recordatorios de medicinas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setActiveTab("today")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "today" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hoy
            {activeTab === "today" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "config" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuración
            {activeTab === "config" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
        </div>
      </div>

      {activeTab === "today" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Recordatorios de hoy -{" "}
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </h3>

            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

              {mockReminderInstances.map((instance) => (
                <div key={instance.id} className="relative flex gap-6">
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
                    {instance.method === "whatsapp" ? (
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

                        {instance.retry_count > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <RotateCcw className="w-3 h-3" />
                            <span>{instance.retry_count} reintentos</span>
                          </div>
                        )}

                        {instance.taken_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Confirmado:{" "}
                            {new Date(instance.taken_at).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>

                      <Pill className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <>
          {/* Search and Filters */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar medicina..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button
                variant={filterActive === true ? "default" : "outline"}
                onClick={() => setFilterActive(filterActive === true ? null : true)}
              >
                Activos
              </Button>
              <Button
                variant={filterActive === false ? "default" : "outline"}
                onClick={() => setFilterActive(filterActive === false ? null : false)}
              >
                Inactivos
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="grid gap-4">
              {filteredReminders.map((reminder) => {
                const recentExecutions = getRecentExecutions(reminder.executions)
                const fillPercentage = reminder.medicine
                  ? (reminder.medicine.tablets_left! / reminder.medicine.total_tablets!) * 100
                  : 0

                return (
                  <Card key={reminder.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-32 bg-gradient-to-b from-cream/30 to-cream/50 rounded-2xl border-3 border-primary flex items-end justify-center overflow-hidden shadow-sm">
                          {reminder.medicine && (
                            <>
                              <div
                                className="w-full bg-gradient-to-b from-primary to-primary/80 transition-all duration-700"
                                style={{ height: `${fillPercentage}%` }}
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Pill
                                  className={`w-10 h-10 ${fillPercentage < 30 ? "text-primary/40" : "text-white/60"}`}
                                />
                                <span
                                  className={`font-bold text-lg mt-1 ${fillPercentage < 30 ? "text-primary" : "text-white"}`}
                                >
                                  {reminder.medicine.tablets_left}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          de {reminder.medicine?.total_tablets}
                        </span>
                      </div>

                      {/* Medicine Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{reminder.medicine?.name}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{reminder.medicine?.dosage}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              reminder.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {reminder.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{reminder.periodicity}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Pill className="w-4 h-4" />
                            <span>{reminder.medicine?.tablets_per_dose}x dosis</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(reminder.start_date).toLocaleDateString("es-ES", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {recentExecutions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Últimas 5 ejecuciones
                            </p>
                            <div className="flex items-center gap-1">
                              {recentExecutions.map((execution, idx) => (
                                <div key={execution.id} className="flex items-center">
                                  <div className="relative group">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                                        execution.status === "success"
                                          ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                                          : "bg-red-100 border-red-500 dark:bg-red-900/30"
                                      }`}
                                    >
                                      {execution.method === "whatsapp" ? (
                                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                      ) : (
                                        <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      )}
                                      {execution.status === "success" ? (
                                        <CheckCircle className="w-3 h-3 text-green-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                                      ) : (
                                        <XCircle className="w-3 h-3 text-red-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                                      )}
                                    </div>

                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                      <div className="font-medium">
                                        {new Date(execution.executed_at).toLocaleString("es-ES")}
                                      </div>
                                      <div className="text-gray-300 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {execution.duration_minutes} min
                                        {execution.retries > 0 && (
                                          <>
                                            <RotateCcw className="w-3 h-3 ml-2" />
                                            {execution.retries}
                                          </>
                                        )}
                                      </div>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>

                                  {idx < recentExecutions.length - 1 && (
                                    <div className="w-4 h-0.5 bg-border mx-0.5"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReminder(reminder)
                            setShowMedicineDetail(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={reminder.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(reminder)}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {filteredReminders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Pill className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">No se encontraron recordatorios</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Intenta con otro término de búsqueda" : "Crea tu primer recordatorio"}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={showMedicineDetail} onOpenChange={setShowMedicineDetail}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar - {selectedReminder?.medicine?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-44 bg-gradient-to-b from-cream/30 to-cream/50 rounded-2xl border-3 border-primary flex items-end justify-center overflow-hidden shadow-lg">
                  {selectedReminder?.medicine && (
                    <>
                      <div
                        className="w-full bg-gradient-to-b from-primary to-primary/80 transition-all duration-700"
                        style={{
                          height: `${(selectedReminder.medicine.tablets_left! / selectedReminder.medicine.total_tablets!) * 100}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Pill
                          className={`w-12 h-12 ${
                            (selectedReminder.medicine.tablets_left! / selectedReminder.medicine.total_tablets!) * 100 <
                            30
                              ? "text-primary/40"
                              : "text-white/60"
                          }`}
                        />
                        <span
                          className={`font-bold text-2xl mt-2 ${
                            (selectedReminder.medicine.tablets_left! / selectedReminder.medicine.total_tablets!) * 100 <
                            30
                              ? "text-primary"
                              : "text-white"
                          }`}
                        >
                          {selectedReminder.medicine.tablets_left}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-center mt-3 text-sm font-semibold">
                  de {selectedReminder?.medicine?.total_tablets} pastillas
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  <input
                    type="text"
                    defaultValue={selectedReminder?.medicine?.name}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Dosis</label>
                    <input
                      type="text"
                      defaultValue={selectedReminder?.medicine?.dosage || ""}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Por dosis</label>
                    <input
                      type="number"
                      defaultValue={selectedReminder?.medicine?.tablets_per_dose}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Total de pastillas</label>
                    <input
                      type="number"
                      defaultValue={selectedReminder?.medicine?.total_tablets || 0}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Pastillas restantes</label>
                    <input
                      type="number"
                      defaultValue={selectedReminder?.medicine?.tablets_left || 0}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground">Configuración del Recordatorio</h3>

              <div>
                <label className="text-sm font-medium text-foreground">Periodicidad</label>
                <select
                  defaultValue={selectedReminder?.periodicity || ""}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option>Cada 8 horas</option>
                  <option>Cada 12 horas</option>
                  <option>Diario</option>
                  <option>Cada 2 días</option>
                  <option>Semanal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de inicio</label>
                  <input
                    type="date"
                    defaultValue={selectedReminder?.start_date}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de fin (opcional)</label>
                  <input
                    type="date"
                    defaultValue={selectedReminder?.end_date || ""}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Notas</label>
                <textarea
                  defaultValue={selectedReminder?.medicine?.notes || ""}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            {selectedReminder && getRecentExecutions(selectedReminder.executions).length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Últimas 5 Ejecuciones</h3>
                <div className="space-y-3">
                  {getRecentExecutions(selectedReminder.executions).map((execution) => (
                    <div key={execution.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          execution.status === "success"
                            ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                            : "bg-red-100 border-red-500 dark:bg-red-900/30"
                        }`}
                      >
                        {execution.method === "whatsapp" ? (
                          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(execution.executed_at).toLocaleString("es-ES")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {execution.duration_minutes} minutos
                          {execution.retries > 0 && ` • ${execution.retries} reintentos`}
                        </p>
                      </div>
                      {execution.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <Button variant="outline" onClick={() => handleToggleActive(selectedReminder!)}>
                <Power className="w-4 h-4 mr-2" />
                {selectedReminder?.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMedicineDetail(false)}>
                Cancelar
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Eliminar Recordatorio
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              ¿Estás seguro de que deseas eliminar el recordatorio de{" "}
              <strong>{selectedReminder?.medicine?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteReminder}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activar Recordatorio - {selectedReminder?.medicine?.name}</DialogTitle>
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
                  defaultValue={selectedReminder?.medicine?.total_tablets || 0}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pastillas restantes</label>
                <input
                  type="number"
                  defaultValue={selectedReminder?.medicine?.tablets_left || 0}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Periodicidad</label>
              <select
                defaultValue={selectedReminder?.periodicity || ""}
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
                  defaultValue={selectedReminder?.start_date}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Fecha de fin (opcional)</label>
                <input
                  type="date"
                  defaultValue={selectedReminder?.end_date || ""}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                console.log("[v0] Activating reminder", selectedReminder?.id)
                setShowActivateDialog(false)
              }}
            >
              Activar Recordatorio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

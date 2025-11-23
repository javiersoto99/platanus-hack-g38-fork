"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  TodayTab,
  ConfigTab,
  MedicineDetailModal,
  DeleteConfirmationModal,
  ActivateReminderModal,
  CreateReminderModal,
  Reminder,
  TodayTabSkeleton,
} from "./components"
import { RemindersService } from "@/lib/reminders"
import { api } from "@/lib/api"
import type { ReminderInstance } from "./components/types"

function RemindersViewContent() {
  const searchParams = useSearchParams()
  
  // Get initial tab from URL or default to "today"
  const getInitialTab = (): "today" | "config" => {
    const tab = searchParams.get("tab")
    return tab === "config" ? "config" : "today"
  }
  
  const [activeTab, setActiveTab] = useState<"today" | "config">(getInitialTab())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [showMedicineDetail, setShowMedicineDetail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Data state - separate loading for each tab
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [reminderInstances, setReminderInstances] = useState<ReminderInstance[]>([])
  const [loadingToday, setLoadingToday] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track which tabs have been loaded using ref to avoid re-renders
  const loadedTabsRef = useRef<Set<"today" | "config">>(new Set())
  
  // Action loading states
  const [togglingReminderId, setTogglingReminderId] = useState<number | null>(null)
  const [deletingReminderId, setDeletingReminderId] = useState<number | null>(null)
  const [activatingReminderId, setActivatingReminderId] = useState<number | null>(null)

  // Memoized loadTabData function
  const loadTabData = useCallback(async (tab: "today" | "config", forceReload = false) => {
    // Skip if already loaded and not forcing reload
    if (!forceReload && loadedTabsRef.current.has(tab)) {
      return
    }

    if (tab === "today") {
      setLoadingToday(true)
      setError(null)
      try {
        const instancesData = await RemindersService.getTodayReminderInstances()
        setReminderInstances(Array.isArray(instancesData) ? [...instancesData] : [])
        loadedTabsRef.current.add("today")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
        console.error("Error loading today data:", err)
      } finally {
        setLoadingToday(false)
      }
    } else if (tab === "config") {
      setLoadingConfig(true)
      setError(null)
      try {
        const remindersData = await RemindersService.getRemindersWithMedicine()
        setReminders(remindersData)
        loadedTabsRef.current.add("config")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
        console.error("Error loading config data:", err)
      } finally {
        setLoadingConfig(false)
      }
    }
  }, [])

  // Load data when tab changes - always reload when tab becomes active
  useEffect(() => {
    // Clear the loaded flag when switching tabs to ensure fresh data
    if (activeTab === "today") {
      loadTabData("today", true)
    } else if (activeTab === "config") {
      loadTabData("config", true)
    }
  }, [activeTab, loadTabData])

  const handleToggleActive = useCallback(async (reminder: Reminder) => {
    if (reminder.is_active) {
      // Deactivate immediately
      setTogglingReminderId(reminder.id)
      try {
        await api.patchReminder(reminder.id, { is_active: false })
        // Reload config tab data
        await loadTabData("config", true)
      } catch (err) {
        console.error("Error deactivating reminder:", err)
        alert("Error al desactivar el recordatorio")
      } finally {
        setTogglingReminderId(null)
      }
    } else {
      // Show dialog to reactivate
      setSelectedReminder(reminder)
      setShowActivateDialog(true)
    }
  }, [loadTabData])

  const handleDeleteReminder = useCallback(async () => {
    if (!selectedReminder) return
    
    setDeletingReminderId(selectedReminder.id)
    try {
      await api.deleteReminder(selectedReminder.id)
      setShowDeleteDialog(false)
      setShowMedicineDetail(false)
      // Reload config tab data
      await loadTabData("config", true)
    } catch (err) {
      console.error("Error deleting reminder:", err)
      alert("Error al eliminar el recordatorio")
    } finally {
      setDeletingReminderId(null)
    }
  }, [selectedReminder, loadTabData])

  const handleCardClick = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder)
    setShowMedicineDetail(true)
  }, [])

  const handleShowDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true)
  }, [])

  const handleActivateReminder = useCallback(async () => {
    if (!selectedReminder) return
    
    setActivatingReminderId(selectedReminder.id)
    try {
      await api.patchReminder(selectedReminder.id, { is_active: true })
      setShowActivateDialog(false)
      // Reload config tab data
      await loadTabData("config", true)
    } catch (err) {
      console.error("Error activating reminder:", err)
      alert("Error al activar el recordatorio")
    } finally {
      setActivatingReminderId(null)
    }
  }, [selectedReminder, loadTabData])
  
  const handleTabChange = useCallback((tab: "today" | "config") => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Recordatorios</h2>
            <p className="text-muted-foreground mt-1">Gestiona los recordatorios de medicinas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => handleTabChange("today")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "today" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hoy
            {activeTab === "today" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
          <button
            onClick={() => handleTabChange("config")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "config" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuración
            {activeTab === "config" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {!error && (
        <>
          {activeTab === "today" && (
            loadingToday ? (
              <TodayTabSkeleton />
            ) : (
              <TodayTab 
                reminderInstances={reminderInstances} 
                onRefresh={() => loadTabData("today", true)}
              />
            )
          )}

          {activeTab === "config" && (
            <ConfigTab
              reminders={reminders}
              searchQuery={searchQuery}
              filterActive={filterActive}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterActive}
              onCardClick={handleCardClick}
              onToggleActive={handleToggleActive}
              loading={loadingConfig}
              togglingReminderId={togglingReminderId}
            />
          )}
        </>
      )}

      <MedicineDetailModal
        isOpen={showMedicineDetail}
        onClose={() => setShowMedicineDetail(false)}
        reminder={selectedReminder}
        onDelete={handleShowDeleteDialog}
        onToggleActive={handleToggleActive}
        isToggling={togglingReminderId === selectedReminder?.id}
        isDeleting={deletingReminderId === selectedReminder?.id}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        reminder={selectedReminder}
        onConfirm={handleDeleteReminder}
        loading={deletingReminderId === selectedReminder?.id}
      />

      <ActivateReminderModal
        isOpen={showActivateDialog}
        onClose={() => setShowActivateDialog(false)}
        reminder={selectedReminder}
        onConfirm={handleActivateReminder}
        loading={activatingReminderId === selectedReminder?.id}
      />

      <CreateReminderModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  )
}

export function RemindersView() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    }>
      <RemindersViewContent />
    </Suspense>
  )
}

"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/sidebar"
import { CalendarView } from "@/app/components/calendar"
import { RemindersView } from "@/app/components/reminders"
import { AppointmentsView } from "@/app/components/appointments"
import { PatientProfile } from "@/app/components/elderly-profile"

type ViewType = "calendar" | "reminders" | "appointments"

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("calendar")
  const [showPatientProfile, setShowPatientProfile] = useState(false)

  const handlePatientClick = () => {
    setShowPatientProfile(true)
  }

  const handleBackFromProfile = () => {
    setShowPatientProfile(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onPatientClick={handlePatientClick} />
      <main className="flex-1 overflow-y-auto">
        {showPatientProfile ? (
          <PatientProfile onBack={handleBackFromProfile} />
        ) : (
          <>
            {activeView === "calendar" && <CalendarView />}
            {activeView === "reminders" && <RemindersView />}
            {activeView === "appointments" && <AppointmentsView />}
          </>
        )}
      </main>
    </div>
  )
}

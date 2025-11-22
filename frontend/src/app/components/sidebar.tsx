"use client"

import { Calendar, Pill, Stethoscope, ChevronLeft } from "lucide-react"
import { useState } from "react"
import clsx from "clsx"

interface SidebarProps {
  activeView: "calendar" | "reminders" | "appointments"
  onViewChange: (view: "calendar" | "reminders" | "appointments") => void
  onPatientClick?: () => void
}

export function Sidebar({ activeView, onViewChange, onPatientClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "reminders", label: "Recordatorios", icon: Pill },
    { id: "calendar", label: "Calendario", icon: Calendar },
  ] as const

  return (
    <aside
      className={clsx(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="/logo-memo.png" 
                alt="Memo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">Memo</h1>
              <p className="text-xs text-muted-foreground truncate">Cuidado para el abuelo</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1"
        >
          <ChevronLeft className={clsx("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onViewChange(id as "calendar" | "reminders")}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                  activeView === id ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted",
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Elderly Info Card */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            onClick={onPatientClick}
            className="w-full bg-primary/10 rounded-lg p-3 text-center hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <p className="text-xs text-muted-foreground mb-1">Cuidando a:</p>
            <p className="font-semibold text-foreground">Abuelo Juan</p>
            <p className="text-xs text-muted-foreground mt-1">87 años</p>
          </button>
        </div>
      )}
    </aside>
  )
}

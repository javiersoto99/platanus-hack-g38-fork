"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit2 } from "lucide-react"

interface PatientProfileProps {
  onBack: () => void
}

export function PatientProfile({ onBack }: PatientProfileProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left Column - Avatar Section */}
          <Card className="p-6 flex flex-col items-center w-80">
            <Avatar className="w-48 h-48 mb-4">
              <AvatarImage src="/elderly-man-contemplative.png" alt="Abuelo Juan" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">AJ</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-foreground text-center">Abuelo Juan</h1>
            <p className="text-muted-foreground text-lg">87 años</p>
          </Card>

          {/* Right Column - Information Card */}
          <Card className="p-8 flex-1">
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Información del Paciente</h2>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            </div>

            {/* Information Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Date of Birth */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Fecha de Nacimiento</label>
                <p className="text-foreground">15 de Marzo, 1937</p>
              </div>

              {/* Blood Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tipo de Sangre</label>
                <p className="text-foreground">O+</p>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Dirección</label>
                <p className="text-foreground">Av. Las Condes 1234, Las Condes, Santiago</p>
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Contacto de Emergencia</label>
                <p className="text-foreground">María González (Hija) - +56 9 1234 5678</p>
              </div>

              {/* Insurance Info */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Seguro Médico</label>
                <p className="text-foreground">Seguro Complementario Plus</p>
              </div>

              {/* Isapre Info */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Isapre</label>
                <p className="text-foreground">Colmena Golden Cross</p>
              </div>

              {/* Medical Notes */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Notas Médicas</label>
                <p className="text-foreground leading-relaxed">
                  Paciente con hipertensión controlada. Alergia a la penicilina. Requiere asistencia para caminar. Dieta
                  baja en sodio recomendada.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

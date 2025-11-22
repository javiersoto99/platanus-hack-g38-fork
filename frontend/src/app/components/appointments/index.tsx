import { Card } from "@/components/ui/card"

export function AppointmentsView() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-3xl font-bold text-foreground">Citas Médicas</h2>
        <p className="text-muted-foreground mt-1">Gestiona las citas médicas del abuelo</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground">Esta vista está en construcción</p>
        </Card>
      </div>
    </div>
  )
}

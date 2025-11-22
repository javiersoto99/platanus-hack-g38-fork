import { Card } from "@/components/ui/card"

export function RemindersView() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-3xl font-bold text-foreground">Recordatorios</h2>
        <p className="text-muted-foreground mt-1">Gestiona los recordatorios de medicinas</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground">Esta vista está en construcción</p>
        </Card>
      </div>
    </div>
  )
}

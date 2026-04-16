"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "@/components/priority-badge"
import { BedDouble, Calendar } from "lucide-react"
import { format } from "date-fns"
import type { PatientWithCounts } from "@/lib/types"

export function PatientCard({
  patient,
  onClick,
}: {
  patient: PatientWithCounts
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-md active:scale-[0.99]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">{patient.name}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {patient.age}y {patient.gender}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {patient.highest_priority && (
              <PriorityBadge priority={patient.highest_priority} />
            )}
            {patient.pending_tasks > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {patient.pending_tasks} task{patient.pending_tasks !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-2 text-sm text-foreground/80">{patient.diagnosis}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3" />
            {patient.ward_bed}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {format(new Date(patient.admission_date), "dd MMM")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

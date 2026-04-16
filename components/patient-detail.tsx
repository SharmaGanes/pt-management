"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotesSection } from "@/components/notes-section"
import { TasksSection } from "@/components/tasks-section"
import { BedDouble, Calendar, UserCheck, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { Patient } from "@/lib/types"

export function PatientDetail({
  patient,
  open,
  onOpenChange,
  onUpdate,
}: {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()

  async function handleDischargeToggle() {
    await supabase
      .from("patients")
      .update({ is_discharged: !patient.is_discharged })
      .eq("id", patient.id)
    onUpdate()
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await supabase.from("patients").delete().eq("id", patient.id)
    onOpenChange(false)
    onUpdate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 pr-6">
            <div>
              <DialogTitle>{patient.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span>{patient.age}y {patient.gender}</span>
                <span className="flex items-center gap-1">
                  <BedDouble className="size-3" />
                  {patient.ward_bed}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {format(new Date(patient.admission_date), "dd MMM yyyy")}
                </span>
              </DialogDescription>
            </div>
            {patient.is_discharged && (
              <Badge variant="secondary">Discharged</Badge>
            )}
          </div>
          <p className="text-sm font-medium text-foreground/80 mt-1">
            {patient.diagnosis}
          </p>
        </DialogHeader>

        <Tabs defaultValue="tasks" className="mt-2">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-3">
            <TasksSection patientId={patient.id} />
          </TabsContent>
          <TabsContent value="notes" className="mt-3">
            <NotesSection patientId={patient.id} />
          </TabsContent>
        </Tabs>

        <div className="mt-2 flex items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={handleDischargeToggle}>
            <UserCheck className="size-3.5" data-icon="inline-start" />
            {patient.is_discharged ? "Readmit" : "Discharge"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" data-icon="inline-start" />
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

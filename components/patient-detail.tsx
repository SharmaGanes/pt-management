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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NotesSection } from "@/components/notes-section"
import { TasksSection } from "@/components/tasks-section"
import { BedDouble, Calendar, UserCheck, Trash2, Pencil, Check, X } from "lucide-react"
import { format } from "date-fns"
import type { Patient, Gender } from "@/lib/types"

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
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(patient.name)
  const [editAge, setEditAge] = useState(String(patient.age))
  const [editGender, setEditGender] = useState<Gender>(patient.gender)
  const [editWardBed, setEditWardBed] = useState(patient.ward_bed)
  const [editDiagnosis, setEditDiagnosis] = useState(patient.diagnosis)
  const [editAdmissionDate, setEditAdmissionDate] = useState(patient.admission_date)
  const supabase = createClient()

  function startEdit() {
    setEditName(patient.name)
    setEditAge(String(patient.age))
    setEditGender(patient.gender)
    setEditWardBed(patient.ward_bed)
    setEditDiagnosis(patient.diagnosis)
    setEditAdmissionDate(patient.admission_date)
    setEditing(true)
  }

  async function handleSaveEdit() {
    await supabase
      .from("patients")
      .update({
        name: editName.trim(),
        age: parseInt(editAge),
        gender: editGender,
        ward_bed: editWardBed.trim(),
        diagnosis: editDiagnosis.trim(),
        admission_date: editAdmissionDate,
      })
      .eq("id", patient.id)
    setEditing(false)
    onUpdate()
  }

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
          {editing ? (
            <div className="flex flex-col gap-2.5 pr-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input id="edit-age" type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} min={0} max={200} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Gender</Label>
                  <Select value={editGender} onValueChange={(v) => setEditGender(v as Gender)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-ward">Ward / Bed</Label>
                <Input id="edit-ward" value={editWardBed} onChange={(e) => setEditWardBed(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-dx">Diagnosis</Label>
                <Input id="edit-dx" value={editDiagnosis} onChange={(e) => setEditDiagnosis(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-date">Admission Date</Label>
                <Input id="edit-date" type="date" value={editAdmissionDate} onChange={(e) => setEditAdmissionDate(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  <X className="size-3.5" data-icon="inline-start" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="size-3.5" data-icon="inline-start" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
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
                <div className="flex items-center gap-1.5 shrink-0">
                  {patient.is_discharged && (
                    <Badge variant="secondary">Discharged</Badge>
                  )}
                  <Button variant="ghost" size="icon-xs" onClick={startEdit} title="Edit patient details">
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground/80 mt-1">
                {patient.diagnosis}
              </p>
            </>
          )}
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

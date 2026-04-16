"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddPatientForm } from "@/components/add-patient-form"
import { PatientCard } from "@/components/patient-card"
import { PatientDetail } from "@/components/patient-detail"
import { Search, Users } from "lucide-react"
import type { Patient, PatientWithCounts, Task, Note, TaskPriority } from "@/lib/types"

const priorityOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function PatientList() {
  const [patients, setPatients] = useState<PatientWithCounts[]>([])
  const [search, setSearch] = useState("")
  const [showDischarged, setShowDischarged] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const supabase = createClient()

  const fetchPatients = useCallback(async () => {
    let query = supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })

    if (!showDischarged) {
      query = query.eq("is_discharged", false)
    }

    const { data: patientsData } = await query
    if (!patientsData) return

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false })

    const tasksByPatient = new Map<string, Task[]>()
    const notesByPatient = new Map<string, Note[]>()

    if (tasksData) {
      for (const task of tasksData as Task[]) {
        const existing = tasksByPatient.get(task.patient_id) ?? []
        existing.push(task)
        tasksByPatient.set(task.patient_id, existing)
      }
    }

    if (notesData) {
      for (const note of notesData as Note[]) {
        const existing = notesByPatient.get(note.patient_id) ?? []
        existing.push(note)
        notesByPatient.set(note.patient_id, existing)
      }
    }

    const withCounts: PatientWithCounts[] = patientsData.map((p) => {
      const tasks = tasksByPatient.get(p.id) ?? []
      const notes = notesByPatient.get(p.id) ?? []
      const pendingTasks = tasks.filter((t) => t.status !== "done")
      let highestPriority: TaskPriority | null = null
      for (const t of pendingTasks) {
        if (!highestPriority || priorityOrder[t.priority] < priorityOrder[highestPriority]) {
          highestPriority = t.priority
        }
      }
      return {
        ...p,
        pending_tasks: pendingTasks.length,
        highest_priority: highestPriority,
        tasks,
        notes,
      }
    })

    setPatients(withCounts)
  }, [supabase, showDischarged])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const filtered = patients.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q) ||
      p.ward_bed.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} on your list
          </p>
        </div>
        <AddPatientForm onAdd={fetchPatients} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, diagnosis, or ward..."
            className="pl-8"
          />
        </div>
        <Button
          variant={showDischarged ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowDischarged(!showDischarged)}
        >
          {showDischarged ? "Hide" : "Show"} discharged
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? "No patients match your search" : "No patients yet. Add your first patient to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onTaskUpdate={fetchPatients}
              onClick={() => {
                setSelectedPatient(patient)
                setDetailOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open)
            if (!open) {
              setSelectedPatient(null)
              fetchPatients()
            }
          }}
          onUpdate={() => {
            fetchPatients()
          }}
        />
      )}
    </div>
  )
}

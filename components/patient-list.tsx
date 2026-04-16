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
import type { Patient, PatientWithCounts, Task, TaskPriority } from "@/lib/types"

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
      .select("patient_id, status, priority")
      .neq("status", "done")

    const taskMap = new Map<string, { count: number; highestPriority: TaskPriority | null }>()
    if (tasksData) {
      for (const task of tasksData as Pick<Task, "patient_id" | "status" | "priority">[]) {
        const existing = taskMap.get(task.patient_id)
        if (!existing) {
          taskMap.set(task.patient_id, { count: 1, highestPriority: task.priority })
        } else {
          existing.count++
          if (
            task.priority &&
            (!existing.highestPriority ||
              priorityOrder[task.priority] < priorityOrder[existing.highestPriority])
          ) {
            existing.highestPriority = task.priority
          }
        }
      }
    }

    const withCounts: PatientWithCounts[] = patientsData.map((p) => {
      const info = taskMap.get(p.id)
      return {
        ...p,
        pending_tasks: info?.count ?? 0,
        highest_priority: info?.highestPriority ?? null,
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

"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TaskItem } from "@/components/task-item"
import { PriorityBadge } from "@/components/priority-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, BedDouble } from "lucide-react"
import { format } from "date-fns"
import type { Patient, Task, TaskPriority } from "@/lib/types"

interface HandoverGroup {
  patient: Patient
  tasks: Task[]
}

const priorityOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function HandoverView() {
  const [groups, setGroups] = useState<HandoverGroup[]>([])
  const supabase = createClient()

  const fetchHandover = useCallback(async () => {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_handover", true)
      .neq("status", "done")
      .order("created_at", { ascending: false })

    if (!tasks || tasks.length === 0) {
      setGroups([])
      return
    }

    const patientIds = [...new Set(tasks.map((t: Task) => t.patient_id))]
    const { data: patients } = await supabase
      .from("patients")
      .select("*")
      .in("id", patientIds)

    if (!patients) return

    const patientMap = new Map(patients.map((p: Patient) => [p.id, p]))
    const groupMap = new Map<string, HandoverGroup>()

    for (const task of tasks as Task[]) {
      const patient = patientMap.get(task.patient_id)
      if (!patient) continue
      const existing = groupMap.get(task.patient_id)
      if (existing) {
        existing.tasks.push(task)
      } else {
        groupMap.set(task.patient_id, { patient, tasks: [task] })
      }
    }

    const sorted = Array.from(groupMap.values()).sort((a, b) => {
      const aTop = Math.min(...a.tasks.map((t) => priorityOrder[t.priority]))
      const bTop = Math.min(...b.tasks.map((t) => priorityOrder[t.priority]))
      return aTop - bTop
    })

    setGroups(sorted)
  }, [supabase])

  useEffect(() => {
    fetchHandover()
  }, [fetchHandover])

  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Night Team Handover</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, dd MMMM yyyy")} &middot; {totalTasks} outstanding task{totalTasks !== 1 ? "s" : ""}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ArrowRightLeft className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No outstanding handover tasks. Flag tasks with the flag icon to add them here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Card key={group.patient.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">{group.patient.name}</CardTitle>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{group.patient.age}y {group.patient.gender}</span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="size-3" />
                        {group.patient.ward_bed}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/70">{group.patient.diagnosis}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 pt-0">
                {group.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onUpdate={fetchHandover} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

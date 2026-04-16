"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityBadge } from "@/components/priority-badge"
import { BedDouble, Calendar, CheckCircle2, Circle, Clock, Flag, StickyNote } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { PatientWithCounts, TaskStatus } from "@/lib/types"

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
}

const statusColors = {
  todo: "text-muted-foreground hover:text-blue-500",
  in_progress: "text-blue-500 hover:text-green-500",
  done: "text-green-500 hover:text-muted-foreground",
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
}

export function PatientCard({
  patient,
  onClick,
  onTaskUpdate,
}: {
  patient: PatientWithCounts
  onClick: () => void
  onTaskUpdate: () => void
}) {
  const supabase = createClient()
  const allTasks = patient.tasks
  const pendingTasks = allTasks.filter((t) => t.status !== "done")
  const doneTasks = allTasks.filter((t) => t.status === "done")
  const recentNotes = patient.notes.slice(0, 3)

  async function cycleTaskStatus(e: React.MouseEvent, taskId: string, currentStatus: TaskStatus) {
    e.stopPropagation()
    await supabase
      .from("tasks")
      .update({ status: nextStatus[currentStatus] })
      .eq("id", taskId)
    onTaskUpdate()
  }

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
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-2.5">
        <p className="text-sm text-foreground/80">{patient.diagnosis}</p>
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

        {allTasks.length > 0 && (
          <div className="flex flex-col gap-1 border-t pt-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
              Tasks ({pendingTasks.length} pending{doneTasks.length > 0 ? `, ${doneTasks.length} done` : ""})
            </p>
            {pendingTasks.slice(0, 5).map((task) => {
              const Icon = statusIcons[task.status]
              return (
                <div key={task.id} className="flex items-center gap-1.5 group/task">
                  <button
                    onClick={(e) => cycleTaskStatus(e, task.id, task.status)}
                    className={cn("shrink-0 transition-colors", statusColors[task.status])}
                    title={task.status === "todo" ? "Mark in progress" : "Mark done"}
                  >
                    <Icon className="size-3.5" />
                  </button>
                  <span className="text-xs truncate flex-1">{task.title}</span>
                  {task.is_handover && (
                    <Flag className="size-2.5 shrink-0 text-orange-500" />
                  )}
                  <PriorityBadge priority={task.priority} />
                </div>
              )
            })}
            {pendingTasks.length > 5 && (
              <p className="text-[10px] text-muted-foreground">
                +{pendingTasks.length - 5} more
              </p>
            )}
            {doneTasks.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 opacity-50">
                {doneTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => cycleTaskStatus(e, task.id, task.status)}
                      className="shrink-0 text-green-500 hover:text-muted-foreground transition-colors"
                      title="Reopen task"
                    >
                      <CheckCircle2 className="size-3.5" />
                    </button>
                    <span className="text-xs truncate flex-1 line-through">{task.title}</span>
                  </div>
                ))}
                {doneTasks.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{doneTasks.length - 3} more done
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {recentNotes.length > 0 && (
          <div className="flex flex-col gap-1 border-t pt-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
              <StickyNote className="size-2.5 inline mr-1" />
              Notes ({patient.notes.length})
            </p>
            {recentNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-1.5">
                <p className="text-xs text-foreground/70 line-clamp-1 flex-1">
                  {note.content}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true }).replace("about ", "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

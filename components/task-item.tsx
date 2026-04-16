"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PriorityBadge } from "@/components/priority-badge"
import { Flag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus } from "@/lib/types"

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  done: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
}

export function TaskItem({
  task,
  onUpdate,
}: {
  task: Task
  onUpdate: () => void
}) {
  const supabase = createClient()

  async function cycleStatus() {
    const nextStatus = statusCycle[task.status]
    await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id)
    onUpdate()
  }

  async function toggleHandover() {
    await supabase
      .from("tasks")
      .update({ is_handover: !task.is_handover })
      .eq("id", task.id)
    onUpdate()
  }

  async function handleDelete() {
    await supabase.from("tasks").delete().eq("id", task.id)
    onUpdate()
  }

  return (
    <div className="group flex items-center gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted/30">
      <Checkbox
        checked={task.status === "done"}
        onCheckedChange={cycleStatus}
        className="shrink-0"
      />
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-sm truncate",
            task.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", statusColors[task.status])}>
          {statusLabels[task.status]}
        </span>
        <PriorityBadge priority={task.priority} />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleHandover}
          className={cn(
            "transition-colors",
            task.is_handover
              ? "text-orange-500 hover:text-orange-600"
              : "text-muted-foreground/40 hover:text-orange-500"
          )}
          title={task.is_handover ? "Remove from handover" : "Add to handover"}
        >
          <Flag className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  )
}

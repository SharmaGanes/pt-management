"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PriorityBadge } from "@/components/priority-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flag, Trash2, Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

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
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority)
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

  async function handleSaveEdit() {
    if (!editTitle.trim()) return
    await supabase
      .from("tasks")
      .update({ title: editTitle.trim(), priority: editPriority })
      .eq("id", task.id)
    setEditing(false)
    onUpdate()
  }

  function startEdit() {
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditing(true)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-2.5 bg-muted/20">
        <div className="flex items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit()
              if (e.key === "Escape") setEditing(false)
            }}
          />
          <Select value={editPriority} onValueChange={(v) => setEditPriority(v as TaskPriority)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 justify-end">
          <Button size="icon-xs" variant="ghost" onClick={() => setEditing(false)}>
            <X className="size-3" />
          </Button>
          <Button size="icon-xs" onClick={handleSaveEdit} disabled={!editTitle.trim()}>
            <Check className="size-3" />
          </Button>
        </div>
      </div>
    )
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
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
          onClick={startEdit}
          title="Edit task"
        >
          <Pencil className="size-3" />
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

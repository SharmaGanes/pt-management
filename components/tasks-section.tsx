"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TaskItem } from "@/components/task-item"
import { AddTaskForm } from "@/components/add-task-form"
import type { Task } from "@/lib/types"

export function TasksSection({ patientId }: { patientId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
    if (data) setTasks(data)
  }, [patientId, supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const doneTasks = tasks.filter((t) => t.status === "done")

  return (
    <div className="flex flex-col gap-3">
      <AddTaskForm patientId={patientId} onAdd={fetchTasks} />

      {tasks.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">No tasks yet</p>
      )}

      {inProgressTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">In Progress</p>
          {inProgressTasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}

      {todoTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">To Do</p>
          {todoTasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Done</p>
          {doneTasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  )
}

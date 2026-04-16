"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { TaskPriority } from "@/lib/types"

export function AddTaskForm({
  patientId,
  onAdd,
}: {
  patientId: string
  onAdd: () => void
}) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("tasks").insert({
      patient_id: patientId,
      user_id: user.id,
      title: title.trim(),
      priority,
      status: "todo",
      is_handover: false,
    })

    setTitle("")
    setPriority("medium")
    setLoading(false)
    onAdd()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="text-sm"
      />
      <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
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
      <Button type="submit" size="icon" disabled={loading || !title.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  )
}

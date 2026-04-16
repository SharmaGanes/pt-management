"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Trash2, Pencil, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Note } from "@/lib/types"

export function NotesSection({ patientId }: { patientId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
    if (data) setNotes(data)
  }, [patientId, supabase])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  async function handleAdd() {
    if (!content.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("notes").insert({
      patient_id: patientId,
      user_id: user.id,
      content: content.trim(),
    })
    setLoading(false)
    if (!error) {
      setContent("")
      fetchNotes()
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editContent.trim()) return
    await supabase.from("notes").update({ content: editContent.trim() }).eq("id", id)
    setEditingId(null)
    setEditContent("")
    fetchNotes()
  }

  async function handleDelete(id: string) {
    await supabase.from("notes").delete().eq("id", id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          className="min-h-[60px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd()
          }}
        />
        <Button size="icon" onClick={handleAdd} disabled={loading || !content.trim()}>
          <Send className="size-4" />
        </Button>
      </div>

      {notes.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">No notes yet</p>
      )}

      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-2 rounded-lg border bg-muted/30 p-2.5"
          >
            {editingId === note.id ? (
              <div className="flex-1 flex flex-col gap-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[50px] resize-none text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSaveEdit(note.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                />
                <div className="flex gap-1 justify-end">
                  <Button size="icon-xs" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="size-3" />
                  </Button>
                  <Button size="icon-xs" onClick={() => handleSaveEdit(note.id)} disabled={!editContent.trim()}>
                    <Check className="size-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => startEdit(note)}
                  >
                    <Pencil className="size-3 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { Gender } from "@/lib/types"

export function AddPatientForm({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<Gender>("Male")
  const [wardBed, setWardBed] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  function resetForm() {
    setName("")
    setAge("")
    setGender("Male")
    setWardBed("")
    setDiagnosis("")
    setAdmissionDate(new Date().toISOString().split("T")[0])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("patients").insert({
      user_id: user.id,
      name,
      age: parseInt(age),
      gender,
      ward_bed: wardBed,
      diagnosis,
      admission_date: admissionDate,
    })

    setLoading(false)
    if (!error) {
      resetForm()
      setOpen(false)
      onAdd()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" data-icon="inline-start" />
            Add Patient
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
          <DialogDescription>Add a patient to your shift list.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-name">Name</Label>
            <Input id="pt-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Patient name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pt-age">Age</Label>
              <Input id="pt-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required min={0} max={200} placeholder="Age" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(val) => setGender(val as Gender)}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
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
            <Label htmlFor="pt-ward">Ward / Bed</Label>
            <Input id="pt-ward" value={wardBed} onChange={(e) => setWardBed(e.target.value)} required placeholder="e.g. Ward 3, Bed 12" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-dx">Diagnosis</Label>
            <Input id="pt-dx" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required placeholder="Working diagnosis" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-date">Admission Date</Label>
            <Input id="pt-date" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Add Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

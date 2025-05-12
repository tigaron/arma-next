"use client"

import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Users } from "lucide-react"

interface AddTeamFormProps {
  onAdd: (name: string) => void
  onCancel: () => void
  isOpen: boolean
}

export function AddTeamForm({ onAdd, onCancel, isOpen }: AddTeamFormProps) {
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim())
      setName("")
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>Add Team</span>
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="teamname" className="text-sm font-medium">
            Team Name
          </label>
          <Input
            id="teamname"
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Add Team
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}

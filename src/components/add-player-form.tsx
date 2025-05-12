"use client"

import { useState } from "react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Plus } from "lucide-react"
import type { PlayerColor } from "~/types"

interface AddPlayerFormProps {
  teamId: string
  color: PlayerColor
  onAdd: (name: string, password: string, teamId: string, color: PlayerColor) => void
  onCancel: () => void
  isOpen: boolean
}

export function AddPlayerForm({ teamId, color, onAdd, onCancel, isOpen }: AddPlayerFormProps) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = () => {
    if (name.trim() && password.trim()) {
      onAdd(name.trim(), password.trim(), teamId, color)
      setName("")
      setPassword("")
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={onCancel}>
        <Plus className="h-4 w-4" />
        <span>Add Player</span>
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="playername" className="text-sm font-medium">
            Player Name
          </label>
          <Input
            id="playername"
            placeholder="Player name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Player Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Player password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!name.trim() || !password.trim()}>
            Add Player
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}

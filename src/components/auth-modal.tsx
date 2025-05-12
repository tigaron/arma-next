"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import type { AuthState } from "~/types"

// Mock authentication data
const ADMIN_PASSWORD = "admin123"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuth: (authState: AuthState) => void
  userPasswords: Record<string, string>
}

export function AuthModal({ open, onOpenChange, onAuth, userPasswords }: AuthModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAuth = () => {
    // Reset error
    setError(null)

    // Check if admin password
    if (password === ADMIN_PASSWORD) {
      onAuth({ role: "admin" })
      onOpenChange(false)
      setPassword("")
      return
    }

    // Check if user password
    for (const [userId, userPassword] of Object.entries(userPasswords)) {
      if (password === userPassword) {
        onAuth({ role: "user", userId })
        onOpenChange(false)
        setPassword("")
        return
      }
    }

    // If we get here, password is invalid
    setError("Invalid password. Please try again.")
  }

  const handleSignOut = () => {
    onAuth({ role: "guest" })
    onOpenChange(false)
    setPassword("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Enter your password to access timer controls.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAuth()
                }
              }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Hint: Admin password is "admin123"</p>
            <p>User passwords are "user1", "user2", "user3"</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button onClick={handleAuth}>Sign In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

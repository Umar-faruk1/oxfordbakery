"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onUpdateRole: (id: string, role: string) => void
}

export function UserRoleDialog({ open, onOpenChange, user, onUpdateRole }: UserRoleDialogProps) {
  const [role, setRole] = useState("")

  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  const handleUpdateRole = () => {
    if (user && role !== user.role) {
      onUpdateRole(user.id, role)
    } else {
      onOpenChange(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>Change the role for this user</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={role === user.role}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

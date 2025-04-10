"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Edit, ShieldAlert, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminHeader } from "@/components/admin/admin-header"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { UserRoleDialog } from "@/components/admin/user-role-dialog"

interface UserData {
  id: string
  email: string
  username: string
  role: string
  avatar_url: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const { supabase } = useSupabase()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query),
        ),
      )
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRole = (user: UserData) => {
    setCurrentUser(user)
    setIsDialogOpen(true)
  }

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const { error } = await supabase.from("users").update({ role }).eq("id", id)

      if (error) throw error

      toast.success(`User role updated to ${role}`)
      fetchUsers()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <AdminHeader title="Users" description="Manage user accounts and roles" />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                      <div className="h-4 w-[150px] animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-[80px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[100px] animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.role === "admin" ? (
                        <ShieldAlert className="mr-1 h-3 w-3" />
                      ) : (
                        <User className="mr-1 h-3 w-3" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => handleEditRole(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserRoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={currentUser}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  )
}

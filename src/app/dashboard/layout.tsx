"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Users, 
  UserCircle, 
  Settings, 
  LogOut 
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/50">
        <div className="p-4">
          <h1 className="text-xl font-bold">My Prophetic Journal</h1>
        </div>
        <nav className="space-y-2 p-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              My Entries
            </Button>
          </Link>
          <Link href="/dashboard/teams">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              My Teams
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="h-full p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 
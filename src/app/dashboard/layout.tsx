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
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 border-r bg-background
      `}>
        <div className="p-4">
          <h1 className="text-xl font-bold">My Prophetic Journal</h1>
        </div>
        <nav className="space-y-2 p-4">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              My Entries
            </Button>
          </Link>
          <Link href="/dashboard/teams" onClick={() => setSidebarOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              My Teams
            </Button>
          </Link>
          <Link href="/dashboard/profile" onClick={() => setSidebarOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link href="/dashboard/settings" onClick={() => setSidebarOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="h-full p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  )
} 
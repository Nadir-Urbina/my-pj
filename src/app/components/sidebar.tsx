"use client"

import Link from "next/link"
import { Book, Users, User, Settings } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">JournalApp</h1>
      </div>
      <nav className="mt-6 space-y-1">
        <Link
          href="/entries"
          className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Book className="mr-3 h-4 w-4" />
          My Entries
        </Link>
        <Link
          href="/teams"
          className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Users className="mr-3 h-4 w-4" />
          My Teams
        </Link>
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <User className="mr-3 h-4 w-4" />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Link>
      </nav>
    </aside>
  )
}


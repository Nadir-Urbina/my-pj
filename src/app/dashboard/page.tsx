"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Image as ImageIcon, AudioWaveform } from "lucide-react"
import { useRouter } from "next/navigation"
import { ShareEntryDialog } from "../components/share-entry-dialog"

interface JournalEntry {
  id: string
  title: string
  content: string
  categories: string[]
  createdAt: any
  userId: string
  audioFiles?: string[]
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return

      const q = query(
        collection(db, "journals"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      )

      const querySnapshot = await getDocs(q)
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[]

      setEntries(entriesData)
    }

    fetchEntries()
  }, [user])

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Entries</h1>
        <Button asChild>
          <Link href="/dashboard/new-entry">New Entry</Link>
        </Button>
      </div>

      <Input
        placeholder="Search entries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-4 flex flex-col relative">
            <div className="absolute top-4 right-4 z-10">
              <ShareEntryDialog entryId={entry.id} />
            </div>

            <div 
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/${entry.id}`)}
            >
              <div className="space-y-1">
                <h2 className="text-xl font-semibold pr-12">{entry.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(entry.createdAt?.toDate()).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  Text
                </div>
                {entry.content.includes('<img') && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Image
                  </div>
                )}
                {(entry.audioFiles?.length ?? 0) > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <AudioWaveform className="w-4 h-4 mr-1" />
                    Audio
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                {entry.categories?.map((category, index) => (
                  <span key={index} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
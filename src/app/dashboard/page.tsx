"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, getDoc, doc } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Image as ImageIcon, AudioWaveform, Plus } from "lucide-react"
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
  sharedWith?: {
    [uid: string]: {
      email: string
      sharedAt: any
      status: 'active' | 'inactive'
    }
  }
}

interface SharedEntry {
  id: string
  entryId: string
  sharedBy: string
  title: string
  content: string
  categories: string[]
  createdAt: any
  userId: string
  audioFiles?: string[]
  sharedWithEmail: string
  status: 'active' | 'inactive'
  type: 'user'
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [sharedEntries, setSharedEntries] = useState<SharedEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return

      // Fetch both owned and shared entries in a single query
      const entriesQuery = query(
        collection(db, "journals"),
        where("userId", "==", user.uid)
        // No need for OR query as we'll fetch shared entries separately for now
      )

      const sharedEntriesQuery = query(
        collection(db, "journals"),
        where(`sharedWith.${user.uid}.status`, "==", "active")
      )

      const [ownedSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(entriesQuery),
        getDocs(sharedEntriesQuery)
      ])

      const ownedEntries = ownedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[]

      const sharedEntries = sharedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[]

      setEntries([...ownedEntries, ...sharedEntries])
    }

    fetchEntries()
  }, [user])

  const privateEntries = entries.filter(entry => entry.userId === user?.uid)
  const sharedWithMeEntries = entries.filter(entry => 
    entry.userId !== user?.uid && 
    entry.sharedWith?.[user?.uid!]?.status === 'active'
  )

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Entries</h1>
        <Link href="/dashboard/new-entry">
          <Button className="lg:hidden w-10 h-10 p-0">
            <Plus />
          </Button>
          <Button className="hidden lg:flex">
            New Entry
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search entries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />

      {/* Private Entries Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Entries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {privateEntries
            .filter(entry => entry.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((entry) => (
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

      {/* Shared Entries Section */}
      {sharedWithMeEntries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Shared With Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedWithMeEntries
              .filter(entry => entry.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 flex flex-col relative bg-muted/30">
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/${entry.entryId}`)}
                  >
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold pr-12">{entry.title}</h2>
                      <p className="text-sm text-gray-500">
                        Shared by: {entry.sharedBy}
                      </p>
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
      )}
    </div>
  )
} 
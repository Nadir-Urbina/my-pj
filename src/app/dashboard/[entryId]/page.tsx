"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { JournalEntry } from "@/app/components/journal-entry"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EntryComments } from "@/app/components/entry-comments"

export default function EntryPage({ params }: { params: { entryId: string } }) {
  const [entry, setEntry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user) return

      try {
        const entryDoc = await getDoc(doc(db, "journals", params.entryId))
        if (entryDoc.exists()) {
          setEntry({ id: entryDoc.id, ...entryDoc.data() })
        }
      } catch (error) {
        console.error("Error fetching entry:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [params.entryId, user])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!entry) {
    return <div>Entry not found</div>
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <JournalEntry initialData={entry} mode="preview" />
      <div className="mt-8">
        <EntryComments entryId={params.entryId} />
      </div>
    </div>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function JoinTeamPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteId = searchParams.get('id')

  useEffect(() => {
    const checkInvite = async () => {
      if (!inviteId) {
        router.push('/dashboard/teams')
        return
      }

      try {
        const inviteRef = doc(db, "teamInvites", inviteId)
        const inviteSnap = await getDoc(inviteRef)

        if (!inviteSnap.exists()) {
          router.push('/dashboard/teams')
          return
        }

        const inviteData = inviteSnap.data()
        setInvite(inviteData)
        setIsLoading(false)

        // If user is logged in and email matches, redirect to teams page
        if (user && user.email === inviteData.invitedEmail) {
          router.push('/dashboard/teams')
        }
      } catch (error) {
        console.error("Error fetching invite:", error)
        setIsLoading(false)
      }
    }

    checkInvite()
  }, [inviteId, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Join {invite.teamName}</CardTitle>
          <CardDescription>
            {user ? 
              "You need to log in with the invited email address" :
              "You need an account to join this team"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This invitation was sent to {invite.invitedEmail}
          </p>
          <div className="flex gap-4">
            <Button 
              className="flex-1"
              onClick={() => router.push(`/register?redirect=${encodeURIComponent(`/teams/join?id=${inviteId}`)}`)}
            >
              Create Account
            </Button>
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/teams/join?id=${inviteId}`)}`)}
            >
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
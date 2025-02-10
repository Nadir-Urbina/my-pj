"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, UserPlus, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { InviteMembersDialog } from "@/app/components/invite-members-dialog"
import { Badge } from "@/components/ui/badge"

interface Team {
  id: string
  name: string
  description: string
  createdBy: string
  members: { userId: string; role: 'admin' | 'member' }[]
  createdAt: any
}

interface TeamInvite {
  id: string
  teamId: string
  teamName: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: any
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    fetchTeams()
    fetchInvites()
    fetchPendingInvites()
  }, [user])

  const fetchTeams = async () => {
    if (!user) return
    
    try {
      // Query for teams where user is either admin or member
      const teamsQuery = query(
        collection(db, "teams"),
        where("members", "array-contains", { 
          userId: user.uid, 
          role: 'member' 
        })
      )
      
      const teamsSnap = await getDocs(teamsQuery)
      const teamsData = teamsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Team))

      setTeams(teamsData)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      })
    }
  }

  const fetchInvites = async () => {
    if (!user) return
    
    const invitesQuery = query(
      collection(db, "teamInvites"),
      where("invitedUserId", "==", user.uid),
      where("status", "==", "pending")
    )
    
    const invitesSnap = await getDocs(invitesQuery)
    const invitesData = invitesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TeamInvite))

    setInvites(invitesData)
  }

  const fetchPendingInvites = async () => {
    if (!user?.email) return
    
    try {
      const invitesQuery = query(
        collection(db, "teamInvites"),
        where("invitedEmail", "==", user.email),
        where("status", "==", "pending")
      )
      
      const invitesSnap = await getDocs(invitesQuery)
      const invitesData = invitesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamInvite))

      // Filter out invites for teams the user is already a member of
      const filteredInvites = invitesData.filter(invite => {
        return !teams.some(team => team.id === invite.teamId)
      })

      setPendingInvites(filteredInvites)

      // Optionally, we can also automatically mark these duplicate invites as 'redundant'
      const duplicateInvites = invitesData.filter(invite => 
        teams.some(team => team.id === invite.teamId)
      )

      // Update status of duplicate invites
      for (const invite of duplicateInvites) {
        const inviteRef = doc(db, "teamInvites", invite.id)
        await updateDoc(inviteRef, {
          status: 'redundant'
        })
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
      toast({
        title: "Error",
        description: "Failed to fetch pending invites",
        variant: "destructive",
      })
    }
  }

  // Make sure to fetch invites whenever teams change
  useEffect(() => {
    if (user) {
      fetchPendingInvites()
    }
  }, [user, teams]) // Add teams as a dependency

  const createTeam = async () => {
    if (!user || !newTeamName.trim()) return
    
    setIsCreatingTeam(true)
    try {
      await addDoc(collection(db, "teams"), {
        name: newTeamName.trim(),
        description: newTeamDescription.trim(),
        createdBy: user.uid,
        members: [{ userId: user.uid, role: 'admin' }],
        createdAt: serverTimestamp(),
      })
      
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      })
      
      fetchTeams()
      setNewTeamName("")
      setNewTeamDescription("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleAcceptInvite = async (inviteId: string) => {
    if (!user) return

    try {
      // 1. Get the invite document
      const inviteRef = doc(db, "teamInvites", inviteId)
      const inviteSnap = await getDoc(inviteRef)
      
      if (!inviteSnap.exists()) {
        toast({
          title: "Error",
          description: "Invite not found",
          variant: "destructive",
        })
        return
      }

      const invite = inviteSnap.data()
      
      // 2. Update the team members
      const teamRef = doc(db, "teams", invite.teamId)
      await updateDoc(teamRef, {
        members: arrayUnion({ userId: user.uid, role: 'member' })
      })

      // 3. Update the invite status
      await updateDoc(inviteRef, {
        status: 'accepted'
      })

      // 4. Refresh the invites list
      fetchPendingInvites()

      // 5. Refresh the teams list
      await fetchTeams()

      toast({
        title: "Success",
        description: "You have joined the team!",
      })
    } catch (error) {
      console.error('Error accepting invite:', error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-6 space-y-8">
      {/* My Teams Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            My Teams
          </CardTitle>
          <CardDescription>Teams you are a member of</CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">You are not a member of any teams yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map(team => {
                const userRole = team.members.find(m => m.userId === user?.uid)?.role
                return (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{team.name}</CardTitle>
                        <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                          {userRole === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </div>
                      <CardDescription>{team.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full">
                        View Team
                      </Button>
                      {userRole === 'admin' && (
                        <InviteMembersDialog
                          teamId={team.id}
                          teamName={team.name}
                          invitedBy={user?.email || ''}
                        />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Pending Invites
          </CardTitle>
          <CardDescription>Team invitations waiting for your response</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvites.length > 0 ? (
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{invite.teamName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invite.invitedBy}
                    </p>
                  </div>
                  <Button onClick={() => handleAcceptInvite(invite.id)}>
                    Accept Invitation
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pending invites.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Team Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Create New Team
          </CardTitle>
          <CardDescription>Start a new team and invite members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Team Description (optional)"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={createTeam}
              disabled={isCreatingTeam || !newTeamName.trim()}
            >
              Create Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Share2, UserPlus } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { serverTimestamp } from "firebase/firestore"
import { getUserProfile } from "@/lib/firebase/user-profile"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  displayName: string
  photoURL: string
}

interface TeamMember {
  userId: string
  email: string
  role: string
}

interface Team {
  id: string
  name: string
  members: { userId: string; role: string }[]
}

interface ShareEntryDialogProps {
  entryId: string
  onShareSuccess?: () => void
}

export function ShareEntryDialog({ entryId, onShareSuccess }: ShareEntryDialogProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setUsers([])
      return
    }

    setIsLoading(true)
    try {
      const usersRef = collection(db, "users")
      const q = searchQuery.toLowerCase()
      
      const emailQueryRef = query(
        usersRef,
        where("email", ">=", q),
        where("email", "<=", q + "\uf8ff"),
        limit(5)
      )
      
      const querySnapshot = await getDocs(emailQueryRef)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User))

      setUsers(results)
    } catch (error) {
      console.error("Error searching users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareWithUser = async (userId: string, userEmail: string) => {
    try {
      const userProfile = await getUserProfile(userId)
      
      await updateDoc(doc(db, "journals", entryId), {
        [`sharedWith.${userId}`]: {
          email: userEmail,
          sharedAt: serverTimestamp(),
          status: 'active',
          sharedByEmail: user?.email,
          userId: userId,
          photoURL: userProfile?.photoURL
        }
      })

      toast({
        title: "Success",
        description: `Journal shared with ${userEmail}`,
        duration: 3000,
      })
      
      if (onShareSuccess) {
        onShareSuccess()
      }

      setTimeout(() => {
        setOpen(false)
      }, 500)

    } catch (error) {
      console.error("Error sharing journal:", error)
      toast({
        title: "Error",
        description: "Failed to share journal. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleShareWithTeam = async (teamId: string, teamName: string) => {
    try {
      toast({
        title: "Sharing...",
        description: "Please wait while we share with the team.",
        duration: 2000,
      })

      // Get the journal entry
      const journalRef = doc(db, "journals", entryId)
      const journalSnap = await getDoc(journalRef)
      
      if (!journalSnap.exists()) {
        throw new Error("Journal entry not found")
      }

      // Get team members
      const teamRef = doc(db, "teams", teamId)
      const teamSnap = await getDoc(teamRef)
      
      if (!teamSnap.exists()) {
        throw new Error("Team not found")
      }

      const teamData = teamSnap.data()
      const teamMembers = teamData.members || [] as TeamMember[]

      // Prepare sharing updates for all team members
      const sharingUpdates: { [key: string]: any } = {}
      teamMembers.forEach((member: TeamMember) => {
        if (member.userId !== user?.uid) {
          sharingUpdates[`sharedWith.${member.userId}`] = {
            email: member.email, // Assuming email is stored in team member data
            sharedAt: serverTimestamp(),
            status: 'active',
            sharedViaTeam: teamId,
            teamName: teamName
          }
        }
      })

      // Update the journal entry with team sharing info
      await updateDoc(journalRef, sharingUpdates)
      
      toast({
        title: "Success!",
        description: `Entry shared with team "${teamName}"`,
        duration: 3000,
      })

    } catch (error) {
      console.error("Error in handleShareWithTeam:", error)
      toast({
        title: "Error",
        description: "Failed to share with team. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  const fetchUserTeams = async () => {
    if (!user) return
    
    try {
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
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  useEffect(() => {
    fetchUserTeams()
  }, [user])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Journal Entry</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="teams">
              <UserPlus className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && (
                <div className="absolute right-2 top-2">
                  {/* You can add a loading spinner here */}
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {users.length > 0 ? (
                users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>{user.email[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName || user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleShareWithUser(user.id, user.email)}
                    >
                      Share
                    </Button>
                  </div>
                ))
              ) : searchQuery.length >= 3 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Type at least 3 characters to search
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-4">
            <div className="space-y-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {team.members.length} members
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleShareWithTeam(team.id, team.name)}
                  >
                    Share
                  </Button>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  You are not a member of any teams yet.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
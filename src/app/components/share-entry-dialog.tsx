"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Mail, Share2, UserPlus } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { addDoc, serverTimestamp } from "firebase/firestore"

interface User {
  id: string
  email: string
  displayName: string
  photoURL: string
}

interface Team {
  id: string
  name: string
  members: { userId: string; role: string }[]
}

export function ShareEntryDialog({ entryId }: { entryId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setUsers([])
      return
    }

    setIsLoading(true)
    try {
      const usersRef = collection(db, "users")
      const q = searchQuery.toLowerCase()
      
      // Simple email search
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
    }
  }

  const handleShareWithUser = async (userId: string, userEmail: string) => {
    try {
      console.log("Starting share process...")  // Debug log
      
      toast({
        title: "Sharing...",
        description: "Please wait while we share the entry.",
        duration: 2000,
      })
      console.log("After first toast")  // Debug log

      // Check if entry is already shared with this user
      const sharedEntriesRef = collection(db, "sharedEntries")
      const q = query(
        sharedEntriesRef,
        where("entryId", "==", entryId),
        where("sharedWith", "==", userId),
        where("status", "==", "active")
      )
      
      const existingShares = await getDocs(q)
      
      if (!existingShares.empty) {
        toast({
          title: "Already shared",
          description: `This entry is already shared with ${userEmail}`,
          duration: 3000,
          variant: "default",
        })
        return
      }

      // Create new share
      await addDoc(sharedEntriesRef, {
        entryId,
        sharedBy: user?.uid,
        sharedWith: userId,
        sharedWithEmail: userEmail,
        type: 'user',
        createdAt: serverTimestamp(),
        status: 'active'
      })

      // Clear the search input and results
      setSearchQuery?.("")
      setUsers([])
      
      // Show success message
      toast({
        title: "Success!",
        description: `Entry shared with ${userEmail}`,
        duration: 3000,
        variant: "default",
      })

    } catch (error) {
      console.error("Error in handleShareWithUser:", error)  // More detailed error
      toast({
        title: "Error",
        description: "Failed to share the entry. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  const handleShareWithTeam = async (teamId: string, teamName: string) => {
    try {
      await addDoc(collection(db, "sharedEntries"), {
        entryId,
        sharedBy: user?.uid,
        teamId,
        teamName,
        type: 'team',
        createdAt: serverTimestamp(),
        status: 'active'
      })

      toast({
        title: "Entry shared",
        description: `The journal entry has been shared with ${teamName}.`,
      })
    } catch (error) {
      console.error("Error sharing entry with team:", error)
      toast({
        title: "Error",
        description: "Failed to share the entry with the team.",
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
    <Dialog>
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
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>{user.displayName?.[0] || user.email[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleShareWithUser(user.id, user.email)}>
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
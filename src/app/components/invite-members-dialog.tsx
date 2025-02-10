"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { UserPlus, Mail, Loader2 } from "lucide-react"

interface InviteMembersDialogProps {
  teamId: string
  teamName: string
  invitedBy: string
}

export function InviteMembersDialog({ teamId, teamName, invitedBy }: InviteMembersDialogProps) {
  const [emails, setEmails] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean)
    
    if (emailList.length === 0) return
    
    setIsInviting(true)
    try {
      // Create invites and capture their IDs
      const inviteRefs = await Promise.all(emailList.map(email => 
        addDoc(collection(db, "teamInvites"), {
          teamId,
          teamName,
          invitedBy,
          invitedEmail: email,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
      ))

      // Send emails with invite IDs
      const response = await fetch('/api/invite-team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          teamName,
          invitedBy,
          emails: emailList,
          inviteIds: inviteRefs.map(ref => ref.id),
        }),
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)

      toast({
        title: "✉️ Invitations Sent!",
        description: `An invitation email has been sent to ${emailList.join(', ')}. They will receive instructions to join your team.`,
        duration: 5000,
      })
      
      setEmails("")
      setOpen(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to send invitations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email Addresses
            </label>
            <Input
              placeholder="Enter email addresses (comma-separated)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter multiple emails separated by commas
            </p>
          </div>
          <Button 
            className="w-full" 
            onClick={handleInvite}
            disabled={isInviting || !emails.trim()}
          >
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invites...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invites
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
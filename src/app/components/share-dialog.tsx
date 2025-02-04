"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Share, Mail, Users, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  entryId: string
  entryTitle: string
  iconOnly?: boolean
}

export function ShareDialog({ entryId, entryTitle, iconOnly = false }: ShareDialogProps) {
  const [shareType, setShareType] = useState<'app' | 'email'>('app')
  const [emails, setEmails] = useState<string>('')
  const [shareLink, setShareLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generateShareLink = async () => {
    // Generate a unique sharing token
    const shareToken = crypto.randomUUID()
    
    // Create share record in Firestore
    const shareRef = await addDoc(collection(db, "shares"), {
      entryId,
      token: shareToken,
      type: 'link',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // Generate shareable link
    const link = `${window.location.origin}/shared/${shareToken}`
    setShareLink(link)
    return link
  }

  const handleEmailShare = async () => {
    const emailList = emails.split(',').map(email => email.trim())
    const link = await generateShareLink()

    // Create share records for each email
    for (const email of emailList) {
      await addDoc(collection(db, "shares"), {
        entryId,
        email,
        type: 'email',
        status: 'pending',
        createdAt: serverTimestamp(),
      })
    }

    // This would trigger a Cloud Function to send emails
    await fetch('/api/share-entry', {
      method: 'POST',
      body: JSON.stringify({
        emails: emailList,
        entryId,
        entryTitle,
        shareLink: link
      })
    })

    toast({
      title: "Shared successfully",
      description: `Entry shared with ${emailList.length} recipient(s)`,
    })
  }

  const copyLink = async () => {
    const link = shareLink || await generateShareLink()
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size={iconOnly ? "icon" : "default"}>
          <Share className={cn(
            "h-4 w-4",
            !iconOnly && "mr-2"
          )} />
          {!iconOnly && "Share"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Journal Entry</DialogTitle>
        </DialogHeader>

        <Tabs value={shareType} onValueChange={(v) => setShareType(v as 'app' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app">
              <Users className="mr-2 h-4 w-4" />
              App Users
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Via Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="app">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Share via Link</h4>
                <div className="flex gap-2">
                  <Input 
                    value={shareLink} 
                    placeholder="Generate a shareable link"
                    readOnly
                  />
                  <Button onClick={copyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Share via Email</h4>
                <Input
                  placeholder="Enter email addresses (comma-separated)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recipients will receive an email with a link to view this entry
                </p>
              </div>
              <Button onClick={handleEmailShare} className="w-full">
                Send Invites
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
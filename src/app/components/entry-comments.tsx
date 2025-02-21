import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { 
  collection, addDoc, getDocs, query, 
  orderBy, serverTimestamp 
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface Comment {
  id: string
  text: string
  createdAt: any
  userId: string
  userEmail: string
  userPhotoURL?: string
}

export function EntryComments({ entryId }: { entryId: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = async () => {
    const commentsRef = collection(db, "journals", entryId, "comments")
    const q = query(commentsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[])
  }

  useEffect(() => {
    fetchComments()
  }, [entryId])

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return
    
    setIsSubmitting(true)
    try {
      const commentsRef = collection(db, "journals", entryId, "comments")
      const commentData = {
        text: newComment.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email!,
        // Only include photoURL if it exists
        ...(user.photoURL && { userPhotoURL: user.photoURL })
      }
      
      await addDoc(commentsRef, commentData)

      setNewComment("")
      fetchComments()
      toast({ title: "Success", description: "Comment added successfully" })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments</h3>
      
      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.userPhotoURL} />
              <AvatarFallback>
                {comment.userEmail[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.userEmail}</span>
                <span className="text-sm text-muted-foreground">
                  {comment.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New comment form */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button 
          onClick={handleSubmitComment}
          disabled={isSubmitting || !newComment.trim()}
        >
          Add Comment
        </Button>
      </div>
    </div>
  )
} 
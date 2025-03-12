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
import { Loader2 } from "lucide-react"

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
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      
      {/* Comment input */}
      <div className="mb-6">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2 min-h-[100px]"
        />
        <Button 
          onClick={handleSubmitComment} 
          disabled={isSubmitting || !newComment.trim()}
          className="w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Add Comment"
          )}
        </Button>
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userPhotoURL} />
                  <AvatarFallback>
                    {comment.userEmail[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{comment.userEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
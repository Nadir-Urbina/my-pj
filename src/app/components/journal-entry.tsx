"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Mic,
  ImageIcon,
  Tag,
  Save,
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
  Loader2,
  Square,
  X,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ShareDialog } from "./share-dialog"

interface UploadedImage {
  url: string
  name: string
}

interface JournalEntryProps {
  initialData?: any
  mode?: 'create' | 'edit' | 'preview'
}

export function JournalEntry({ initialData, mode = 'create' }: JournalEntryProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [categories, setCategories] = useState<string[]>(initialData?.categories || [])
  const [newCategory, setNewCategory] = useState("")
  const [title, setTitle] = useState(initialData?.title || "")
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [audioFiles, setAudioFiles] = useState<Array<{ url: string, id: string }>>(
    initialData?.audioFiles || []
  )
  const [isPreview, setIsPreview] = useState(mode === 'preview')
  const [recordingTime, setRecordingTime] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const editor = useEditor({
    extensions: [StarterKit, Underline, Image],
    content: initialData?.content || "<p>Start writing your journal entry...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      let chunks: Blob[] = []  // Local chunks array
      
      recorder.onstart = () => {
        chunks = []  // Reset chunks locally
      }

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)  // Add to local chunks
      }

      recorder.onstop = async () => {
        // Stop the stream tracks
        stream.getTracks().forEach(track => track.stop())
        
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' })
        
        if (!user) return
        
        try {
          const audioId = uuidv4()
          const storageRef = ref(storage, `journal-audio/${user.uid}/${audioId}.mp3`)
          await uploadBytes(storageRef, audioBlob)
          const url = await getDownloadURL(storageRef)
          
          setAudioFiles(prev => [...prev, { url, id: audioId }])
          
          toast({
            title: "Success",
            description: "Voice recording added to entry",
          })
        } catch (error) {
          console.error('Error uploading audio:', error)
          toast({
            title: "Error",
            description: "Failed to save voice recording",
            variant: "destructive",
          })
        }
      }

      setMediaRecorder(recorder)
      recorder.start(1000)  // Start recording with 1 second timeslices
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !user) return

      try {
        const imageId = uuidv4()
        const storageRef = ref(storage, `journal-images/${user.uid}/${imageId}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        
        editor?.chain().focus().setImage({ src: url }).run()
        
        setImages(prev => [...prev, { url, name: file.name }])
      } catch (error) {
        console.error('Error uploading image:', error)
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        })
      }
    }

    input.click()
  }

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory("")
    }
  }

  const handleSave = async () => {
    setShowValidation(true)

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an entry",
        variant: "destructive",
      })
      return
    }

    if (!title || !editor?.getHTML()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'edit' && initialData?.id) {
        await updateDoc(doc(db, "journals", initialData.id), {
          title,
          content: editor?.getHTML(),
          categories,
          audioFiles,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, "journals"), {
          title,
          content: editor?.getHTML(),
          categories,
          audioFiles,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      toast({
        title: "Success",
        description: `Entry ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id || !user) return
    
    setIsLoading(true)
    try {
      // Delete audio files
      for (const audio of audioFiles) {
        const audioRef = ref(storage, `journal-audio/${user.uid}/${audio.id}.mp3`)
        await deleteObject(audioRef).catch(console.error)
      }
      
      // Delete entry
      await deleteDoc(doc(db, "journals", initialData.id))
      
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          placeholder="Entry Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "text-lg font-semibold",
            showValidation && !title && "border-red-500 focus-visible:ring-red-500"
          )}
          required
        />
        
        {audioFiles.length > 0 && (
          <div className="space-y-2">
            {audioFiles.map((audio) => (
              <div key={audio.id} className="flex items-center gap-2 p-2 border rounded-md">
                <audio controls src={audio.url} className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const audioRef = ref(storage, `journal-audio/${user?.uid}/${audio.id}.mp3`)
                    deleteObject(audioRef).catch(console.error)
                    setAudioFiles(prev => prev.filter(a => a.id !== audio.id))
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {isPreview ? (
          <div 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
          />
        ) : (
          <div className="border rounded-lg">
            <div className="flex flex-wrap gap-1 p-2 border-b items-center">
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Toggle>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Toggle heading"
              >
                <Heading2 className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
              >
                <List className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
              >
                <ListOrdered className="h-4 w-4" />
              </Toggle>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Toggle blockquote"
              >
                <Quote className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                aria-label="Toggle code"
              >
                <Code className="h-4 w-4" />
              </Toggle>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-[200px] p-3">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center"
          >
            {isRecording ? (
              <Square className="mr-2 h-4 w-4 fill-current" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {isRecording ? `Stop Recording (${recordingTime}s)` : "Start Recording"}
          </Button>
          <Button onClick={handleImageUpload} variant="outline" className="flex items-center">
            <ImageIcon className="mr-2 h-4 w-4" />
            Attach Image
          </Button>
          <div className="flex-1 flex items-center space-x-2">
            <Input placeholder="Add a category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            <Button onClick={addCategory} variant="outline" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {category}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {mode === 'edit' && (
            <ShareDialog 
              entryId={initialData.id} 
              entryTitle={title}
            />
          )}
          {mode === 'create' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Discard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will discard all changes. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push("/dashboard")}>
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {mode === 'edit' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Entry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your journal entry.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Saving..." : mode === 'edit' ? "Update Entry" : "Save Entry"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  {mode === 'edit' 
                    ? "This will update your journal entry."
                    : "This will create a new journal entry."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>
                  {mode === 'edit' ? "Update" : "Save"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}


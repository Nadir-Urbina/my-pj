"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

interface ImageUploadProps {
  currentImageUrl?: string
  onUploadComplete: (url: string) => void
  className?: string
}

export function ImageUpload({ 
  currentImageUrl, 
  onUploadComplete,
  className = "w-24 h-24" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `profile-photos/${user.uid}/${Date.now()}.${fileExtension}`
      const storageRef = ref(storage, fileName)

      // Upload the file
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)
      
      onUploadComplete(downloadUrl)
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <div className={`rounded-full bg-muted flex items-center justify-center overflow-hidden ${className}`}>
        {currentImageUrl ? (
          <img 
            src={currentImageUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        // Enable camera on mobile devices
        capture="user"
      />

      <Button 
        size="sm" 
        className="absolute bottom-0 right-0"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Change"
        )}
      </Button>
    </div>
  )
} 
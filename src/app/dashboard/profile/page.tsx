"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/firebase/user-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera } from "lucide-react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"

const SPIRITUAL_GIFTS = [
  "Prophecy",
  "Teaching",
  "Wisdom",
  "Knowledge",
  "Faith",
  "Healing",
  "Miracles",
  "Discernment",
  "Tongues",
  "Interpretation",
  "Administration",
  "Leadership",
  "Mercy",
  "Giving",
  "Evangelism"
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const userProfile = await getUserProfile(user.uid)
      if (userProfile) {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, profile)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Your profile picture will be visible to your prayer partners and team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <ImageUpload
              currentImageUrl={profile.photoURL}
              onUploadComplete={(url) => handleChange('photoURL', url)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your personal information visible to other users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username || ''}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about your spiritual journey..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ministry Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ministry Information</CardTitle>
          <CardDescription>Share your role and spiritual gifts with the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homebaseMinistry">Homebase Ministry</Label>
            <Input
              id="homebaseMinistry"
              value={profile.homebaseMinistry || ''}
              onChange={(e) => handleChange('homebaseMinistry', e.target.value)}
              placeholder="e.g., New Life Church, Kingdom Embassy..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spiritualLeader">Spiritual Leader</Label>
            <Input
              id="spiritualLeader"
              value={profile.spiritualLeader || ''}
              onChange={(e) => handleChange('spiritualLeader', e.target.value)}
              placeholder="e.g., Pastor John Smith..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ministryRole">Ministry Role</Label>
            <Input
              id="ministryRole"
              value={profile.ministryRole || ''}
              onChange={(e) => handleChange('ministryRole', e.target.value)}
              placeholder="e.g., Pastor, Prophet, Teacher..."
            />
          </div>
          <div className="space-y-2">
            <Label>Spiritual Gifts</Label>
            <Select
              value={profile.spiritualGifts?.[0] || ''}
              onValueChange={(value) => handleChange('spiritualGifts', [value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a spiritual gift" />
              </SelectTrigger>
              <SelectContent>
                {SPIRITUAL_GIFTS.map((gift) => (
                  <SelectItem key={gift} value={gift.toLowerCase()}>
                    {gift}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Achievements and recognition in your spiritual journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.badges?.map((badge) => (
              <div
                key={badge}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {badge}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
} 
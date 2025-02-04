"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { FirebaseError } from "firebase/app"
import { Separator } from "@/components/ui/separator"
import { isUsernameAvailable, createUserProfile, generateUsername } from "@/lib/firebase/user-profile"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState({
    email: false,
    google: false
  })
  
  const { signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleGoogleSignUp = async () => {
    setIsLoading(prev => ({ ...prev, google: true }))
    try {
      const userCredential = await signInWithGoogle()
      // Create or update user profile
      if (userCredential.user) {
        await createUserProfile(userCredential.user.uid, {
          fullName: userCredential.user.displayName || '',
          username: generateUsername(userCredential.user.displayName || ''),
          email: userCredential.user.email || '',
          photoURL: userCredential.user.photoURL || '',
          bio: '',
          dateOfBirth: '',
          joinedAt: new Date().toISOString(),
          badges: ['newcomer'],
          ministryRole: '',
          homebaseMinistry: '',
          spiritualLeader: '',
          spiritualGifts: [],
          prayerPartners: [],
          journalCount: 0,
          lastActive: new Date().toISOString(),
        })
      }
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      handleAuthError(error)
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }))
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!(await validateForm())) return
    
    setIsLoading(prev => ({ ...prev, email: true }))

    try {
      const userCredential = await signUp(formData.email, formData.password)
      // Create user profile
      if (userCredential.user) {
        await createUserProfile(userCredential.user.uid, {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          photoURL: '',
          bio: '',
          dateOfBirth: '',
          joinedAt: new Date().toISOString(),
          badges: ['newcomer'],
          ministryRole: '',
          homebaseMinistry: '',
          spiritualLeader: '',
          spiritualGifts: [],
          prayerPartners: [],
          journalCount: 0,
          lastActive: new Date().toISOString(),
        })
      }
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      handleAuthError(error)
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }))
    }
  }

  const validateForm = async () => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Username is required.",
        variant: "destructive",
      })
      return false
    }

    // Check username availability
    const isAvailable = await isUsernameAvailable(formData.username)
    if (!isAvailable) {
      toast({
        title: "Error",
        description: "This username is already taken.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleAuthError = (error: unknown) => {
    const firebaseError = error as FirebaseError
    let errorMessage = "Failed to create account."

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        errorMessage = "An account with this email already exists."
        break
      case 'auth/invalid-email':
        errorMessage = "Invalid email address."
        break
      case 'auth/operation-not-allowed':
        errorMessage = "Email/password accounts are not enabled. Please contact support."
        break
      case 'auth/weak-password':
        errorMessage = "Password should be at least 6 characters."
        break
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
    console.error("Registration error:", firebaseError)
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your details to create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignUp}
            disabled={isLoading.google || isLoading.email}
          >
            {isLoading.google ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading.email || isLoading.google}
            >
              {isLoading.email ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Account
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
} 
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { FirebaseError } from "firebase/app"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState({
    email: false,
    google: false
  })
  const { signIn, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(prev => ({ ...prev, email: true }))
    
    try {
      await signIn(email, password)
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      const firebaseError = error as FirebaseError
      let errorMessage = "Invalid email or password."
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email."
          break
        case 'auth/wrong-password':
          errorMessage = "Incorrect password."
          break
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later."
          break
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled."
          break
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }))
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(prev => ({ ...prev, google: true }))
    
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      })
      router.push("/dashboard")
    } catch (error) {
      const firebaseError = error as FirebaseError
      let errorMessage = "Failed to sign in with Google."
      
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in cancelled. Please try again."
          break
        case 'auth/popup-blocked':
          errorMessage = "Pop-up blocked by browser. Please allow pop-ups and try again."
          break
        case 'auth/account-exists-with-different-credential':
          errorMessage = "An account already exists with this email using a different sign-in method."
          break
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }))
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignIn}
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

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading.email || isLoading.google}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading.email || isLoading.google}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading.email || isLoading.google}
            >
              {isLoading.email ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          className="text-sm text-muted-foreground"
          onClick={() => router.push("/auth/reset-password")}
          disabled={isLoading.email || isLoading.google}
        >
          Forgot your password?
        </Button>
      </CardFooter>
    </Card>
  )
} 
"use client"

import { useState } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="text-xl font-bold">
            My Prophetic Journal
          </Link>
        </div>
      </header>

      {/* Auth Forms */}
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4">
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              variant={isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
            >
              Register
            </Button>
          </div>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
} 
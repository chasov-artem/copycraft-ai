"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    setIsSubmitting(true)
    try {
      await logout()
      router.push("/login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Особистий кабінет</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-600">
              Ви увійшли як: <span className="font-medium">{user?.email}</span>
            </p>
            <Button
              onClick={handleLogout}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isSubmitting ? "Вихід..." : "Вийти"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

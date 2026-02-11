"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { createCheckoutSession } from "@/lib/mock-payment-service"

const MOCK_PRO_PRICE_ID = "pro_monthly_49"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStartCheckout() {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    setError(null)
    setIsRedirecting(true)
    try {
      const session = await createCheckoutSession(MOCK_PRO_PRICE_ID, user.uid)
      router.push(session.url)
    } catch {
      setError("Не вдалося створити checkout-сесію. Спробуйте ще раз.")
      setIsRedirecting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="border-slate-200">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Demo Checkout
            </Badge>
            <CardTitle className="text-2xl">CopyCraft AI Pro - $49/місяць</CardTitle>
            <p className="text-sm text-slate-600">
              Доступ до всіх шаблонів, пріоритетна підтримка та розширений режим генерації.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Необмежений доступ до Pro шаблонів</li>
              <li>Швидший конструктор та розширені поля</li>
              <li>Керування підпискою на сторінці Billing</li>
            </ul>

            <Button
              type="button"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={isRedirecting}
              onClick={handleStartCheckout}
            >
              {isRedirecting ? "Переходимо до оплати..." : "Продовжити до оплати"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

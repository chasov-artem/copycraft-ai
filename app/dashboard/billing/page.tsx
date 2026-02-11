"use client"

import Link from "next/link"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { cancelSubscription } from "@/lib/mock-payment-service"
import { cancelUserSubscription } from "@/lib/subscription-service"

export default function BillingPage() {
  const { user, refreshUser, isLoading } = useAuth()
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = user?.subscription?.status === "active"
  const planLabel = isActive ? "Pro" : "Free"

  async function handleCancelSubscription() {
    if (!user?.uid) {
      return
    }

    setError(null)
    setIsCancelling(true)
    try {
      await cancelSubscription(user.uid)
      await cancelUserSubscription(user.uid)
      await refreshUser()
    } catch {
      setError("Не вдалося скасувати підписку. Спробуйте ще раз.")
      setIsCancelling(false)
      return
    }

    setIsCancelling(false)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <Skeleton className="mb-3 h-6 w-1/3" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Повернутися до дашборду
        </Link>

        <Card className="border-slate-200">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Billing & Subscription</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Поточний план:</span>
              <Badge className={isActive ? "bg-emerald-100 text-emerald-700" : ""}>{planLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-700">
                Статус підписки:{" "}
                <span className="font-medium">
                  {user?.subscription?.status ?? "inactive"}
                </span>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                У demo-режимі історія платежів імітується локально.
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Історія (демо)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Pro Plan - $49 - статус: paid (simulated)</li>
                <li>Invoice ID: mock_invoice_001</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isActive && (
                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <Link href="/checkout">Перейти до оплати Pro</Link>
                </Button>
              )}
              {isActive && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Скасовуємо..." : "Скасувати підписку"}
                </Button>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

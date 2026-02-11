"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { verifyPayment } from "@/lib/mock-payment-service"
import { activateUserPro } from "@/lib/subscription-service"

function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16)
}

function formatCardNumber(value: string): string {
  const normalized = normalizeCardNumber(value)
  return normalized.replace(/(.{4})/g, "$1 ").trim()
}

function isValidLuhn(cardNumber: string): boolean {
  const digits = normalizeCardNumber(cardNumber)
  if (digits.length < 13) {
    return false
  }

  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

function isValidExpiry(value: string): boolean {
  const trimmed = value.trim()
  if (!/^\d{2}\/\d{2}$/.test(trimmed)) {
    return false
  }

  const [mm, yy] = trimmed.split("/").map((part) => Number(part))
  if (mm < 1 || mm > 12) {
    return false
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1

  if (yy < currentYear) {
    return false
  }
  if (yy === currentYear && mm < currentMonth) {
    return false
  }
  return true
}

export default function MockSessionCheckoutPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const sessionId = params?.sessionId ?? ""
  const { user, isLoading, refreshUser } = useAuth()

  const [cardholderName, setCardholderName] = useState("Test User")
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [expiry, setExpiry] = useState("12/30")
  const [cvc, setCvc] = useState("123")
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return Boolean(cardholderName.trim() && cardNumber.trim() && expiry.trim() && cvc.trim())
  }, [cardholderName, cardNumber, expiry, cvc])

  async function handlePay() {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    if (!isValidLuhn(cardNumber)) {
      setError("Некоректний номер картки (перевірка Luhn не пройдена).")
      return
    }
    if (!isValidExpiry(expiry)) {
      setError("Некоректний термін дії картки. Використовуйте формат MM/YY.")
      return
    }
    if (!/^\d{3,4}$/.test(cvc.trim())) {
      setError("Некоректний CVC.")
      return
    }

    setError(null)
    setIsPaying(true)

    try {
      const result = await verifyPayment(sessionId)
      if (!result.success) {
        throw new Error("Платіж не підтверджено. Спробуйте ще раз.")
      }

      await activateUserPro(user.uid, result.customerId)

      await fetch("/api/mock-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, userId: user.uid }),
      })

      await refreshUser()
      router.replace("/dashboard?success=true")
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Не вдалося завершити оплату. Спробуйте ще раз."
      )
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-80 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link href="/checkout" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Повернутися до чекауту
        </Link>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Оплата Pro-плану - $49</CardTitle>
            <p className="text-sm text-slate-600">
              Демо-форма. Для тесту використовуйте картку 4242 4242 4242 4242.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {isPaying ? (
              <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-8/12" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Ім&apos;я на картці</Label>
                  <Input
                    id="cardholderName"
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    placeholder="Ivan Petrenko"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Номер картки</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Термін дії (MM/YY)</Label>
                    <Input
                      id="expiry"
                      value={expiry}
                      onChange={(event) =>
                        setExpiry(event.target.value.replace(/[^\d/]/g, "").slice(0, 5))
                      }
                      placeholder="12/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      value={cvc}
                      onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="button"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={isPaying || !canSubmit}
              onClick={handlePay}
            >
              {isPaying ? "Підтвердження платежу..." : "Сплатити $49"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

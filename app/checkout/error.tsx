"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Помилка checkout</h1>
        <p className="mt-2 text-sm text-slate-600">
          Не вдалося завершити операцію. Спробуйте ще раз.
        </p>
        <Button className="mt-4" onClick={reset}>
          Спробувати ще раз
        </Button>
      </div>
    </main>
  )
}

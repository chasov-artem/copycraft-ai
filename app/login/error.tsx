"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function LoginError({
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Помилка сторінки входу</h1>
        <Button className="mt-4" onClick={reset}>
          Повторити
        </Button>
      </div>
    </main>
  )
}

"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function RootError({
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
      <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Щось пішло не так</h1>
        <p className="mt-3 text-sm text-slate-600">
          Сталася неочікувана помилка. Спробуйте ще раз або оновіть сторінку.
        </p>
        <Button className="mt-5" onClick={reset}>
          Спробувати знову
        </Button>
      </div>
    </main>
  )
}

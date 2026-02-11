"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { FilterPanel, type TemplateFilters } from "@/components/dashboard/filter-panel"
import { TemplateCard } from "@/components/dashboard/template-card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllTemplates, type TemplateRecord } from "@/lib/templates-service"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TemplateFilters>({
    category: "all",
    tags: [],
    searchTerm: "",
  })

  const isPaymentSuccess = searchParams.get("success") === "true"

  async function handleLogout() {
    setIsSubmitting(true)
    try {
      await logout()
      router.push("/login")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadTemplates() {
      setIsLoading(true)
      setError(null)
      try {
        const allTemplates = (await getAllTemplates()) as TemplateRecord[]
        if (!isMounted) {
          return
        }
        setTemplates(allTemplates)
      } catch (loadError) {
        if (!isMounted) {
          return
        }
        setError("Не вдалося завантажити шаблони. Спробуйте оновити сторінку.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTemplates()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const normalizedSearch = filters.searchTerm.toLowerCase().trim()
    const nextTemplates = templates.filter((template) => {
      const matchesCategory =
        filters.category === "all" || template.data.category === filters.category
      const matchesTags =
        filters.tags.length === 0 ||
        filters.tags.some((selectedTag) => (template.data.tags ?? []).includes(selectedTag))
      const matchesSearch =
        normalizedSearch.length === 0 ||
        template.data.title.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesTags && matchesSearch
    })

    setFilteredTemplates(nextTemplates)
  }, [templates, filters])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Бібліотека шаблонів</h1>
            <p className="text-sm text-slate-600">
              Ви увійшли як: <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isSubmitting ? "Вихід..." : "Вийти"}
          </Button>
        </div>

        {isPaymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            Підписка Pro активована успішно. Дякуємо за оплату!
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">Billing</Link>
          </Button>
        </div>

        <FilterPanel templates={templates} onFilterChange={setFilters} />

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="mb-3 h-5 w-1/3" />
                <Skeleton className="mb-3 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-11/12" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredTemplates.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            За цими фільтрами шаблонів не знайдено.
          </div>
        )}

        {!isLoading && !error && filteredTemplates.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

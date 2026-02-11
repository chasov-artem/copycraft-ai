"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { FilterPanel, type TemplateFilters } from "@/components/dashboard/filter-panel"
import { TemplateCard } from "@/components/dashboard/template-card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { getAllTemplates, type TemplateRecord } from "@/lib/templates-service"

export default function DashboardPage() {
  const router = useRouter()
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

        <FilterPanel templates={templates} onFilterChange={setFilters} />

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Завантаження шаблонів...
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
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTemplateById, type TemplateRecord } from "@/lib/templates-service"

const CATEGORY_LABELS: Record<string, string> = {
  sale: "Для продажу",
  rent: "Для оренди",
  commercial: "Комерція",
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export default function TemplateDetailsPage() {
  const params = useParams<{ id: string }>()
  const templateId = params?.id
  const [template, setTemplate] = useState<TemplateRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!templateId) {
      setError("Некоректний ID шаблону.")
      setIsLoading(false)
      return
    }

    let isMounted = true
    async function loadTemplateDetails() {
      setIsLoading(true)
      setError(null)
      try {
        const templateDoc = (await getTemplateById(templateId)) as TemplateRecord | null
        if (!isMounted) {
          return
        }
        if (!templateDoc) {
          setError("Шаблон не знайдено.")
          return
        }
        setTemplate(templateDoc)
      } catch (loadError) {
        if (!isMounted) {
          return
        }
        setError("Не вдалося завантажити шаблон. Спробуйте пізніше.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTemplateDetails()
    return () => {
      isMounted = false
    }
  }, [templateId])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Повернутися до бібліотеки
        </Link>

        {isLoading && (
          <Card className="border-slate-200">
            <CardContent className="p-6 text-sm text-slate-600">Завантаження шаблону...</CardContent>
          </Card>
        )}

        {!isLoading && error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {!isLoading && !error && template && (
          <Card className="border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{getCategoryLabel(template.data.category)}</Badge>
                {(template.data.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl">{template.data.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Опис</h2>
                <p className="text-sm leading-6 text-slate-600">{template.data.description}</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Поля для заповнення</h2>
                {(template.data.inputFields ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Поля не вказані для цього шаблону.</p>
                ) : (
                  <div className="space-y-2">
                    {(template.data.inputFields ?? []).map((field) => (
                      <div
                        key={field.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-900">{field.label}</span>
                        <span className="ml-2 text-slate-600">({field.type})</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Приклад результату</h2>
                <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-slate-700">
                  {template.data.previewText ?? "Приклад результату поки відсутній."}
                </div>
              </section>

              <div className="pt-2">
                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <Link href="#">Перейти до конструктора</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

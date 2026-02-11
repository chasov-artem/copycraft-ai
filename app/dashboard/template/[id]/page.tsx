"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { mockAIGeneration } from "@/lib/ai-mock-service"
import { createCheckoutSession } from "@/lib/mock-payment-service"
import {
  getTemplateById,
  type TemplateInputField,
  type TemplateRecord,
} from "@/lib/templates-service"

const CATEGORY_LABELS: Record<string, string> = {
  sale: "Для продажу",
  rent: "Для оренди",
  commercial: "Комерція",
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

const DEFAULT_INPUT_FIELDS: TemplateInputField[] = [
  {
    id: "propertyType",
    label: "Тип нерухомості",
    type: "text",
    placeholder: "Наприклад, 3-кімнатна квартира",
    required: true,
  },
  {
    id: "location",
    label: "Розташування",
    type: "text",
    placeholder: "Наприклад, Печерський район",
    required: true,
  },
  {
    id: "keyFeatures",
    label: "Ключові переваги",
    type: "textarea",
    placeholder: "Опис...",
    required: false,
  },
]

function getInputFields(template: TemplateRecord | null): TemplateInputField[] {
  const fields = template?.data.inputFields
  if (!Array.isArray(fields) || fields.length === 0) {
    return DEFAULT_INPUT_FIELDS
  }
  return fields
}

export default function TemplateDetailsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const templateId = params?.id
  const [template, setTemplate] = useState<TemplateRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isProActive = user?.subscription?.status === "active"

  useEffect(() => {
    if (!templateId) {
      setLoadError("Некоректний ID шаблону.")
      setIsLoading(false)
      return
    }

    let isMounted = true
    async function loadTemplateDetails() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const templateDoc = (await getTemplateById(templateId)) as TemplateRecord | null
        if (!isMounted) {
          return
        }
        if (!templateDoc) {
          setLoadError("Шаблон не знайдено.")
          return
        }
        setTemplate(templateDoc)
      } catch (loadError) {
        if (!isMounted) {
          return
        }
        setLoadError("Не вдалося завантажити шаблон. Спробуйте пізніше.")
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

  useEffect(() => {
    if (!template) {
      return
    }

    const initialFormData = getInputFields(template).reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = ""
      return acc
    }, {})

    setFormData(initialFormData)
    setGeneratedText("")
    setError(null)
  }, [template])

  const inputFields = getInputFields(template)

  function handleFieldChange(fieldId: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  function validateRequiredFields(fields: TemplateInputField[]): string | null {
    for (const field of fields) {
      if (!field.required) {
        continue
      }

      const value = String(formData[field.id] ?? "").trim()
      if (!value) {
        return `Заповніть обов'язкове поле: ${field.label}.`
      }
    }

    return null
  }

  async function handleGenerateText() {
    if (!template) {
      return
    }

    const validationError = validateRequiredFields(inputFields)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const result = await mockAIGeneration(template.id, formData)
      setGeneratedText(result)
    } catch (generationError) {
      setGeneratedText("")
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Не вдалося згенерувати текст. Спробуйте ще раз."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopyText() {
    if (!generatedText) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedText)
      setError(null)
    } catch {
      setError("Не вдалося скопіювати текст у буфер обміну.")
    }
  }

  async function handleStartCheckout() {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    setIsCheckoutLoading(true)
    setError(null)
    try {
      const session = await createCheckoutSession("pro_monthly_49", user.uid)
      router.push(session.url)
    } catch {
      setError("Не вдалося перейти до оплати. Спробуйте ще раз.")
      setIsCheckoutLoading(false)
    }
  }

  function renderInputField(field: TemplateInputField) {
    if (field.type === "textarea") {
      return (
        <textarea
          id={field.id}
          value={formData[field.id] ?? ""}
          onChange={(event) => handleFieldChange(field.id, event.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      )
    }

    return (
      <Input
        id={field.id}
        type={field.type}
        value={formData[field.id] ?? ""}
        onChange={(event) => handleFieldChange(field.id, event.target.value)}
        placeholder={field.placeholder ?? ""}
        required={field.required}
      />
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Повернутися до бібліотеки
        </Link>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && loadError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{loadError}</CardContent>
          </Card>
        )}

        {!isLoading && !loadError && template && (
          <Card className="border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{getCategoryLabel(template.data.category)}</Badge>
                {isProActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Pro</Badge>
                )}
                {(template.data.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl">{template.data.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-sm leading-6 text-slate-600">{template.data.description}</p>

              <Tabs defaultValue="builder" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2 sm:max-w-md">
                  <TabsTrigger value="builder" className="px-4 py-2 text-sm sm:text-base">
                    Конструктор
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="px-4 py-2 text-sm sm:text-base">
                    Попередній перегляд
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="mt-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Заповніть дані</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {inputFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>
                              {field.label}
                              {field.required && <span className="ml-1 text-red-500">*</span>}
                            </Label>
                            {renderInputField(field)}
                          </div>
                        ))}

                        <div className="space-y-2 pt-2">
                          <Button
                            type="button"
                            onClick={handleGenerateText}
                            disabled={isGenerating}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            {isGenerating ? (
                              <span className="inline-flex items-center gap-2">
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                                  className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                                />
                                Генеруємо...
                              </span>
                            ) : (
                              "Згенерувати текст"
                            )}
                          </Button>
                          {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Результат</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!generatedText && !isGenerating && (
                          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                            Тут з&apos;явиться згенерований текст
                          </div>
                        )}

                        {isGenerating && (
                          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-10/12" />
                            <Skeleton className="h-4 w-8/12" />
                          </div>
                        )}

                        {generatedText && !isGenerating && (
                          <div className="rounded-md border border-slate-200 bg-slate-100 p-4 text-sm leading-6 text-slate-800">
                            {generatedText}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!generatedText || isGenerating}
                            onClick={handleCopyText}
                          >
                            Скопіювати
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isGenerating}
                            onClick={() => {
                              setGeneratedText("")
                              setError(null)
                            }}
                          >
                            Згенерувати знову
                          </Button>
                          {!isProActive && (
                            <Button
                              type="button"
                              disabled={isCheckoutLoading}
                              onClick={handleStartCheckout}
                            >
                              {isCheckoutLoading
                                ? "Переходимо до оплати..."
                                : "Отримати Pro за $49/місяць"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Попередній приклад</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-slate-700">
                        {template.data.previewText ?? "Приклад результату поки відсутній."}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-900">Поля шаблону</h3>
                        <div className="flex flex-wrap gap-2">
                          {inputFields.map((field) => (
                            <Badge key={field.id} variant="outline">
                              {field.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

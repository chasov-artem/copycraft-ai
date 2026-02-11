"use client"

import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type TemplateRecord } from "@/lib/templates-service"

type TemplateCardProps = {
  template: TemplateRecord
}

const CATEGORY_LABELS: Record<string, string> = {
  sale: "Для продажу",
  rent: "Для оренди",
  commercial: "Комерція",
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()

  function navigateToDetails() {
    router.push(`/dashboard/template/${template.id}`)
  }

  return (
    <Card
      className="flex h-full cursor-pointer flex-col border-slate-200 transition hover:border-indigo-300 hover:shadow-md"
      onClick={navigateToDetails}
    >
      <CardHeader className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          {getCategoryLabel(template.data.category)}
        </Badge>
        <CardTitle className="text-lg leading-snug">{template.data.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-sm text-slate-600">{template.data.description}</p>
        <div className="flex flex-wrap gap-2">
          {(template.data.tags ?? []).map((tag) => (
            <Badge key={tag} variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={(event) => {
            event.stopPropagation()
            navigateToDetails()
          }}
        >
          Використати
        </Button>
      </CardFooter>
    </Card>
  )
}

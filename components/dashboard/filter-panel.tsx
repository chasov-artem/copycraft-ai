"use client"

import { useMemo, useState } from "react"
import { type CheckedState } from "@radix-ui/react-checkbox"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type TemplateRecord } from "@/lib/templates-service"

export type TemplateFilters = {
  category: string
  tags: string[]
  searchTerm: string
}

type FilterPanelProps = {
  templates: TemplateRecord[]
  onFilterChange: (filters: TemplateFilters) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "Усі",
  sale: "Для продажу",
  rent: "Для оренди",
  commercial: "Комерція",
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function FilterPanel({ templates, onFilterChange }: FilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const availableTags = useMemo(() => {
    const tags = templates.flatMap((template) => template.data.tags ?? [])
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b))
  }, [templates])

  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(templates.map((template) => template.data.category).filter(Boolean))
    )
    const withAll = ["all", ...categories]
    return withAll.sort((a, b) => {
      if (a === "all") return -1
      if (b === "all") return 1
      return a.localeCompare(b)
    })
  }, [templates])

  function emitFilters(overrides?: Partial<TemplateFilters>) {
    onFilterChange({
      category: overrides?.category ?? selectedCategory,
      tags: overrides?.tags ?? selectedTags,
      searchTerm: overrides?.searchTerm ?? searchTerm,
    })
  }

  function handleTagChange(tag: string, checked: CheckedState) {
    const isChecked = checked === true
    const nextTags = isChecked
      ? [...selectedTags, tag]
      : selectedTags.filter((existingTag) => existingTag !== tag)
    setSelectedTags(nextTags)
    emitFilters({ tags: nextTags })
  }

  function handleResetFilters() {
    setSelectedCategory("all")
    setSelectedTags([])
    setSearchTerm("")
    onFilterChange({ category: "all", tags: [], searchTerm: "" })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="template-category">Категорія</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              emitFilters({ category: value })
            }}
          >
            <SelectTrigger id="template-category">
              <SelectValue placeholder="Оберіть категорію" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="template-search">Пошук за назвою</Label>
          <div className="flex gap-2">
            <Input
              id="template-search"
              placeholder="Наприклад: квартира, оренда, комерція"
              value={searchTerm}
              onChange={(event) => {
                const nextSearchTerm = event.target.value
                setSearchTerm(nextSearchTerm)
                emitFilters({ searchTerm: nextSearchTerm })
              }}
            />
            <Button type="button" variant="outline" onClick={() => emitFilters()}>
              Пошук
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label>Теги</Label>
        <div className="flex flex-wrap gap-4">
          {availableTags.length === 0 && (
            <p className="text-sm text-slate-500">Теги поки недоступні.</p>
          )}
          {availableTags.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => handleTagChange(tag, checked)}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="ghost" onClick={handleResetFilters}>
          Скинути фільтри
        </Button>
      </div>
    </section>
  )
}

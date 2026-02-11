import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore"

import { db } from "@/lib/firebase/config"

export type TemplateInputField = {
  id: string
  label: string
  type: string
  required?: boolean
}

export type TemplateData = {
  title: string
  description: string
  category: string
  tags: string[]
  inputFields?: TemplateInputField[]
  previewText?: string
}

export type TemplateRecord = {
  id: string
  data: TemplateData
}

const templatesCollection = collection(db, "templates")

function mapTemplateSnapshot(
  snapshot: Awaited<ReturnType<typeof getDocs>>
): TemplateRecord[] {
  return snapshot.docs.map((templateDoc) => ({
    id: templateDoc.id,
    data: templateDoc.data() as TemplateData,
  }))
}

export async function getAllTemplates(): Promise<Array<{ id: string; data: any }>> {
  const templatesQuery = query(templatesCollection, orderBy("title"))
  const snapshot = await getDocs(templatesQuery)
  return mapTemplateSnapshot(snapshot)
}

export async function getTemplatesByCategory(
  category: string
): Promise<Array<{ id: string; data: any }>> {
  const templatesQuery = query(templatesCollection, where("category", "==", category))
  const snapshot = await getDocs(templatesQuery)
  return mapTemplateSnapshot(snapshot)
}

export async function getTemplatesByTags(
  tags: string[]
): Promise<Array<{ id: string; data: any }>> {
  if (tags.length === 0) {
    return getAllTemplates()
  }

  const templatesQuery = query(templatesCollection, where("tags", "array-contains-any", tags))
  const snapshot = await getDocs(templatesQuery)
  return mapTemplateSnapshot(snapshot)
}

export async function searchTemplatesByTitle(
  searchTerm: string
): Promise<Array<{ id: string; data: any }>> {
  const templates = await getAllTemplates()
  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  if (!normalizedSearchTerm) {
    return templates
  }

  return templates.filter((template) =>
    String(template.data?.title ?? "")
      .toLowerCase()
      .includes(normalizedSearchTerm)
  )
}

export async function getTemplateById(id: string): Promise<{ id: string; data: any } | null> {
  const templateRef = doc(db, "templates", id)
  const snapshot = await getDoc(templateRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    data: snapshot.data() as TemplateData,
  }
}

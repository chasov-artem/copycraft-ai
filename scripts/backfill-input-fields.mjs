import fs from "node:fs/promises"
import path from "node:path"

import { initializeApp } from "firebase/app"
import { collection, doc, getDocs, getFirestore, setDoc } from "firebase/firestore"

const DEFAULT_INPUT_FIELDS = [
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

async function loadEnvFromLocalFile() {
  const envPath = path.resolve(process.cwd(), ".env.local")
  const raw = await fs.readFile(envPath, "utf-8")
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function getFirebaseConfig() {
  const requiredEnv = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(", ")}. Add them to .env.local.`
    )
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

async function loadTemplatesConfig() {
  const templatesPath = path.resolve(process.cwd(), "data", "templates.json")
  const raw = await fs.readFile(templatesPath, "utf-8")
  const templates = JSON.parse(raw)

  if (!Array.isArray(templates)) {
    throw new Error("data/templates.json must be an array.")
  }

  const byId = new Map()
  for (const template of templates) {
    if (template?.id && Array.isArray(template.inputFields) && template.inputFields.length > 0) {
      byId.set(template.id, template.inputFields)
    }
  }
  return byId
}

async function backfillInputFields() {
  await loadEnvFromLocalFile()
  const app = initializeApp(getFirebaseConfig())
  const db = getFirestore(app)
  const templatesCollection = collection(db, "templates")
  const defaultsByTemplateId = await loadTemplatesConfig()
  const snapshot = await getDocs(templatesCollection)

  let updatedCount = 0
  for (const templateDoc of snapshot.docs) {
    const data = templateDoc.data()
    const hasInputFields = Array.isArray(data.inputFields) && data.inputFields.length > 0
    if (hasInputFields) {
      continue
    }

    const fallbackFields = defaultsByTemplateId.get(templateDoc.id) ?? DEFAULT_INPUT_FIELDS
    await setDoc(
      doc(db, "templates", templateDoc.id),
      { inputFields: fallbackFields },
      { merge: true }
    )

    updatedCount += 1
    console.log(`Updated ${templateDoc.id}`)
  }

  console.log(`Done. Updated ${updatedCount} template(s).`)
}

backfillInputFields().catch((error) => {
  console.error("Failed to backfill template input fields:", error)
  process.exitCode = 1
})

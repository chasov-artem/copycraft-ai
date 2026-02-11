import fs from "node:fs/promises"
import path from "node:path"

import { initializeApp } from "firebase/app"
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore"

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

async function loadTemplates() {
  const templatesPath = path.resolve(process.cwd(), "data", "templates.json")
  const raw = await fs.readFile(templatesPath, "utf-8")
  const data = JSON.parse(raw)

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("data/templates.json must be a non-empty array.")
  }

  return data
}

async function seedTemplates() {
  await loadEnvFromLocalFile()

  const app = initializeApp(getFirebaseConfig())
  const db = getFirestore(app)
  const templates = await loadTemplates()

  for (const template of templates) {
    if (!template.id) {
      throw new Error("Each template must contain an 'id' field.")
    }

    await setDoc(
      doc(db, "templates", template.id),
      {
        title: template.title,
        description: template.description,
        category: template.category,
        tags: template.tags ?? [],
        inputFields: template.inputFields ?? [],
        previewText: template.previewText ?? "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )

    console.log(`Seeded template: ${template.id}`)
  }

  console.log(`Done. Seeded ${templates.length} templates.`)
}

seedTemplates().catch((error) => {
  console.error("Failed to seed templates:", error)
  process.exitCode = 1
})

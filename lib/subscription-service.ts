import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"

import { getFirebaseDb } from "@/lib/firebase/config"

export type SubscriptionStatus = "inactive" | "active" | "canceled"
export type SubscriptionPlan = "free" | "pro"

export type UserSubscription = {
  status: SubscriptionStatus
  plan: SubscriptionPlan
  customerId?: string
}

export const DEFAULT_SUBSCRIPTION: UserSubscription = {
  status: "inactive",
  plan: "free",
}

function isValidStatus(value: unknown): value is SubscriptionStatus {
  return value === "inactive" || value === "active" || value === "canceled"
}

function isValidPlan(value: unknown): value is SubscriptionPlan {
  return value === "free" || value === "pro"
}

export function mapSubscription(data: unknown): UserSubscription {
  const record = (data as Record<string, unknown> | undefined) ?? {}
  const status = isValidStatus(record.status) ? record.status : DEFAULT_SUBSCRIPTION.status
  const plan = isValidPlan(record.plan) ? record.plan : DEFAULT_SUBSCRIPTION.plan
  const customerId =
    typeof record.customerId === "string" && record.customerId.trim() ? record.customerId : undefined

  return { status, plan, customerId }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const db = getFirebaseDb()
  const snapshot = await getDoc(doc(db, "users", userId))
  if (!snapshot.exists()) {
    return DEFAULT_SUBSCRIPTION
  }

  const userData = snapshot.data() as { subscription?: unknown }
  return mapSubscription(userData.subscription)
}

export async function setUserSubscription(
  userId: string,
  subscription: UserSubscription
): Promise<void> {
  const db = getFirebaseDb()
  await setDoc(
    doc(db, "users", userId),
    {
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        ...(subscription.customerId ? { customerId: subscription.customerId } : {}),
      },
      subscriptionUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function activateUserPro(userId: string, customerId?: string): Promise<void> {
  await setUserSubscription(userId, {
    status: "active",
    plan: "pro",
    ...(customerId ? { customerId } : {}),
  })
}

export async function cancelUserSubscription(userId: string): Promise<void> {
  await setUserSubscription(userId, {
    status: "canceled",
    plan: "free",
  })
}
